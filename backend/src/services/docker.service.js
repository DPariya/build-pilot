import Docker from "dockerode";
import path from "path";
import fs from "fs";
import tar from "tar-fs";

import { publisher } from "../config/redis.js";
import { logError } from "../utils/logger.js";

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

export const runBuildPipeline = async (projectPath, config, buildId) => {
  const { image, steps } = config.build;

  try {
    // 1️⃣ Pull image if not present
    console.log(`Pulling image: ${image}`);
    await new Promise((resolve, reject) => {
      docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, resolve);
      });
    });

    console.log("Image ready.");

    // 2️⃣ Create container
    const container = await docker.createContainer({
      Image: image,
      Tty: false,
      Cmd: ["tail", "-f", "/dev/null"], // keep container running
      WorkingDir: "/app",
    });

    // 3️⃣ Start container
    await container.start();
    console.log("Container started.");

    // Copy code into container
    const tarStream = tar.pack(projectPath);
    await container.putArchive(tarStream, { path: "/app" });

    let fullLogs = "";

    // 4️⃣ Execute steps sequentially
    for (const step of steps) {
      console.log(`Running step: ${step}`);

      const exec = await container.exec({
        Cmd: ["sh", "-c", step],
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({ hijack: true, stdin: false });

      await new Promise((resolve, reject) => {
        stream.on("data", (chunk) => {
          const log = chunk
            .slice(8)
            .toString("utf-8")
            .replace(/[\x00-\x08]/g, "");
          fullLogs += log;
          // Publish to Redis
          publisher.publish(`build-logs:${buildId}`, log);
          process.stdout.write(log); // temporary console streaming
        });

        stream.on("end", resolve);
        stream.on("error", reject);
      });

      const inspect = await exec.inspect();
      if (inspect.ExitCode !== 0) {
        throw new Error(`Step failed: ${step}`);
      }
    }

    // 5️⃣ Stop container
    await container.stop();
    await container.remove();

    console.log("Build completed successfully.");

    return {
      success: true,
      logs: fullLogs,
    };
  } catch (error) {
    logError("Build failed", error);
    console.error("Build failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
