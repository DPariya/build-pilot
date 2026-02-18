import pool from "../config/db.js";
import crypto from "crypto";

export const createProject = async (name, repoUrl) => {
  const webhookSecret = crypto.randomBytes(32).toString("hex");
  const result = await pool.query(
    `INSERT INTO projects (name, repo_url, webhook_secret)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, repoUrl, webhookSecret],
  );
  return result.rows[0];
};
export const findProjectByRepoUrl = async (repoUrl) => {
  const normalized = repoUrl.replace(/\.git$/, "");
  const result = await pool.query(
    `SELECT * FROM projects WHERE REPLACE(repo_url, '.git', '') = $1`,
    [normalized],
  );
  return result.rows[0];
};
