import { buildQueue } from "../config/queue.js";
import pool from "../config/db.js";
import { runBuildPipeline } from "../services/docker.service.js";
import path from "path";
import simpleGit from "simple-git";
import fs from "fs";
import { createDeployment } from "../models/deployment.model.js";
import { deployService } from "../services/deploy.service.js";
import { logError } from "../utils/logger.js";

buildQueue.process("build", async (job) => {
  const { buildId, repoUrl, branch, projectId } = job.data;
  const repoPath = `/tmp/build-${buildId}`;
  let config = null;
  console.log(`Processing build ${buildId}`);

  try {
    // 1️. Mark as running
    await pool.query(
      "UPDATE builds SET status = 'running', started_at = NOW() WHERE id = $1",
      [buildId],
    );

    // 2. Clone repo
    const git = simpleGit();
    await git.clone(repoUrl, repoPath, ["-b", branch]);
    const files = fs.readdirSync(repoPath);
    console.log("Cloned files:", files);

    // 3. Read YAML
    const configPath = path.join(repoPath, "buildpilot.yml");

    const { parseBuildConfig } = await import("../utils/yaml.parser.js");
    config = parseBuildConfig(configPath);

    // 4. Run Docker build
    const result = await runBuildPipeline(repoPath, config, buildId);
    if (!result.success) {
      throw new Error(result.error);
    }

    // 5. Mark success
    await pool.query(
      `UPDATE builds 
       SET status = 'success', finished_at = NOW(), logs = $2, config = $3
       WHERE id = $1`,
      [buildId, result.logs, JSON.stringify(config)],
    );

    console.log(`Build ${buildId} completed`);

    //6. Create deployment record
    // if (config.deploy) {
    //   const deployment = await createDeployment(
    //     buildId,
    //     projectId,
    //     config.deploy.target,
    //   );

    //   await deployService(config, deployment.id);
    // }
  } catch (error) {
    // console.error(`Build ${buildId} failed:`, error.message);
    logError(`Build ${buildId} failed`, error);
    // Mark failed — WITH error logs   ← AND HERE
    await pool.query(
      `UPDATE builds 
       SET status = 'failed', finished_at = NOW(), logs = $2
       WHERE id = $1`,
      [buildId, error.message],
    );

    throw error;
  } finally {
    // Cleanup cloned repo
    fs.rmSync(repoPath, { recursive: true, force: true });
  }
  //6. Create deployment record
  try {
    if (config?.deploy) {
      try {
        const deployment = await createDeployment(
          buildId,
          projectId,
          config.deploy.target,
        );
        await deployService(config, deployment.id);
      } catch (deployError) {
        // console.error(
        //   `Deployment failed for build ${buildId}:`,
        //   deployError.message,
        // );
        logError(`Deployment failed for build ${buildId}`, deployError);
      }
    }
  } catch (error) {
    console.error(`Build ${buildId} failed:`, error.message);
    logError(`Build ${buildId} failed`, error);
    await pool.query(
      `UPDATE builds SET status = 'failed', finished_at = NOW(), logs = $2 WHERE id = $1`,
      [buildId, error.message],
    );
    throw error;
  } finally {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }
});
