import { createProject } from "../models/project.model.js";

export const createProjectHandler = async (req, res) => {
  try {
    const { name, repo_url } = req.body;

    if (!name || !repo_url) {
      return res.status(400).json({
        message: "name and repo_url are required",
      });
    }

    const project = await createProject(name, repo_url);

    return res.status(201).json({
      message: "Project created",
      project,
    });
  } catch (error) {
    if (error.code === "23505") {
      // unique violation
      return res.status(409).json({
        message: "Project with this repo_url already exists",
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Failed to create project",
    });
  }
};
