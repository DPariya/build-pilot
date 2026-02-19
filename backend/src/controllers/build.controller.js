import * as Build from "../models/build.model.js";
import { buildQueue as queue } from "../config/queue.js";
import { logError } from "../utils/logger.js";

export const getBuildById = async (req, res) => {
  try {
    const build = await Build.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    res.json(build);
  } catch (err) {
    logError("BuildController.getBuildById", err);
    res.status(500).json({ message: "Failed to fetch build" });
  }
};

export const getBuildsByProject = async (req, res) => {
  try {
    const builds = await Build.findByProjectId(req.params.id);

    res.json(builds);
  } catch (err) {
    logError("BuildController.getBuildsByProject", err);
    res.status(500).json({ message: "Failed to fetch builds" });
  }
};

export const retryBuild = async (req, res) => {
  try {
    const build = await Build.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    if (build.status !== "failed") {
      return res.status(400).json({
        message: "Only failed builds can be retried",
      });
    }

    await queue.add("build", {
      buildId: build.id,
      projectId: build.project_id,
    });

    res.json({ message: "Build retry queued" });
  } catch (err) {
    logError("BuildController.retryBuild", err);
    res.status(500).json({ message: "Failed to retry build" });
  }
};
