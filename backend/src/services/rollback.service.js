import pool from "../config/db.js";
import {
  findLatestSuccessful,
  markRolledBack,
} from "../models/deployment.model.js";
import { logError } from "../utils/logger.js";
import { deployService } from "./deploy.service.js";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export const rollbackDeployment = async (deploymentId) => {
  // 1. Find current deployment
  const current = await pool.query("SELECT * FROM deployments WHERE id = $1", [
    deploymentId,
  ]);

  if (!current.rows[0]) {
    throw new Error("Deployment not found");
  }

  const deployment = current.rows[0];

  // 2. Stop current container if running
  if (deployment.container_id) {
    try {
      const container = docker.getContainer(deployment.container_id);
      await container.stop();
      await container.remove();
    } catch (err) {
      logError("Error stopping container during rollback", err);
      console.log("Container already stopped");
    }
  }

  // 3. Mark current as rolled back
  await markRolledBack(deployment.id);

  // 4. Find previous successful deployment
  const previous = await findLatestSuccessful(deployment.project_id);
  if (!previous) {
    throw new Error("No previous successful deployment found");
  }
  console.log("previous", previous);
  // After finding previous successful deployment
  const buildResult = await pool.query(
    "SELECT config FROM builds WHERE id = $1",
    [previous.build_id],
  );
  const config = buildResult.rows[0].config;
  if (!previous) {
    throw new Error("No previous successful deployment found");
  }

  // 5. Re-deploy previous version
  await deployService(config, previous.id);

  return previous;
};
