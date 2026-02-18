import express from "express";
import {
  createProjectHandler,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectByRepoUrl,
} from "../controllers/project.controller.js";
import { getBuildsByProject } from "../controllers/build.controller.js";
const router = express.Router();

router.post("/", createProjectHandler);

router.get("/", getAllProjects);
router.get("/repo", getProjectByRepoUrl);
// Builds under project
router.get("/:id/builds", getBuildsByProject);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
