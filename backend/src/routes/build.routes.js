import express from "express";
const router = express.Router();

import { getBuildById, retryBuild } from "../controllers/build.controller.js";

router.get("/:id", getBuildById);
router.post("/:id/retry", retryBuild);

export default router;
