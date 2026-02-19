import { findProjectByRepoUrl } from "../models/project.model.js";
import { createBuild } from "../models/build.model.js";
import { buildQueue } from "../config/queue.js";
import { logError } from "../utils/logger.js";

export const handleGithubWebhook = async (req, res) => {
  try {
    const event = req.headers["x-github-event"];

    if (event !== "push") {
      return res.status(200).json({ message: "Event ignored" });
    }

    const payload = req.body;

    const repoUrl = payload.repository.clone_url;
    const branch = payload.ref.replace("refs/heads/", "");
    const commitHash = payload.after;
    const commitMessage = payload.head_commit?.message;

    const project = await findProjectByRepoUrl(repoUrl);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const build = await createBuild(
      project.id,
      commitHash,
      branch,
      commitMessage,
    );
    await buildQueue.add("build", {
      buildId: build.id,
      projectId: project.id,
      repoUrl: project.repo_url,
      branch,
      commitHash,
    });

    return res.status(201).json({
      message: "Build queued",
      buildId: build.id,
    });
  } catch (error) {
    logError("Error processing GitHub webhook", error);
    console.error(error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};
