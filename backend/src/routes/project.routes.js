import express from "express";
import { createProjectHandler } from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", createProjectHandler);

export default router;
