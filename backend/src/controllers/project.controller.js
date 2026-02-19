import * as Project from "../models/project.model.js";
import { logError } from "./../utils/logger";

export const createProjectHandler = async (req, res) => {
  try {
    const { name, repo_url } = req.body;

    if (!name || !repo_url) {
      return res.status(400).json({
        message: "name and repo_url are required",
      });
    }

    const project = await Project.createProject(name, repo_url);

    return res.status(201).json({
      message: "Project created",
      project,
    });
  } catch (error) {
    logError("Error creating project", error);
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

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (err) {
    logError("Error fetching projects", err);
    console.error(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    logError("Error fetching project by ID", err);
    res.status(500).json({ message: "Failed to fetch project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const updated = await Project.updateProjectById(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updated);
  } catch (err) {
    logError("Error updating project", err);
    res.status(500).json({ message: "Failed to update project" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await Project.deleteProjectById(req.params.id);
    res.status(204).send();
  } catch (err) {
    logError("Error deleting project", err);
    res.status(500).json({ message: "Failed to delete project" });
  }
};
export const getProjectByRepoUrl = async (req, res) => {
  try {
    const repoUrl = req.query.repoUrl;

    if (!repoUrl) {
      return res.status(400).json({ message: "repoUrl is required" });
    }
    const project = await Project.findProjectByRepoUrl(repoUrl);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    logError("Error fetching project by repo URL", err);
    res.status(500).json({ message: "Failed to fetch project by repo URL" });
  }
};
