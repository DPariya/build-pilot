import Docker from "dockerode";
import { updateStatus } from "../models/deployment.model.js";
import { logError } from "../utils/logger.js";

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

export const deployService = async (config, deploymentId) => {
  try {
    const { image } = config.build;
    const envVars = config.deploy?.environment || {};

    const envArray = Object.entries(envVars).map(
      ([key, value]) => `${key}=${value}`,
    );

    const container = await docker.createContainer({
      Image: image,
      Env: envArray,
      Cmd: ["tail", "-f", "/dev/null"],
      HostConfig: {
        RestartPolicy: { Name: "always" },
      },
    });

    await container.start();

    await updateStatus(deploymentId, "success", container.id);

    console.log("Deployment successful:", container.id);
  } catch (error) {
    logError("DeployService", error);
    console.error("Deployment failed:", error.message);
    await updateStatus(deploymentId, "failed");
    throw error;
  }
};
