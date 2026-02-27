import Docker from "dockerode";
import { updateStatus } from "../models/deployment.model.js";
import { logError } from "../utils/logger.js";
import { findByProjectId } from "../models/deployment.model.js";

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
    //before creating new container, stop and remove old one if exists
    const previousDeployments = await findByProjectId(projectId);
    for (const dep of previousDeployments) {
      if (dep.container_id && dep.status === "success") {
        try {
          const old = docker.getContainer(dep.container_id);
          await old.stop();
          await old.remove();
        } catch (e) {
          /* already stopped */
        }
      }
    }

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
