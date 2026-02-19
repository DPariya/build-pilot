import express from "express";
import { findByProjectId } from "../models/deployment.model.js";
import { rollbackDeployment } from "../services/rollback.service.js";

const router = express.Router();

router.get("/:id/deployments", async (req, res) => {
  const deployments = await findByProjectId(req.params.id);
  res.json(deployments);
});

router.post("/:id/rollback", async (req, res) => {
  const result = await rollbackDeployment(req.params.id);
  res.json({ message: "Rollback successful", result });
});

export default router;
