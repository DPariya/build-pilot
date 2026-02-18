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

export const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM projects ORDER BY created_at DESC`,
  );
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM projects WHERE id = $1`, [
    id,
  ]);
  return rows[0];
};

export const updateProjectById = async (id, data) => {
  const { name, repo_url, webhook_secret, default_branch } = data;

  const { rows } = await pool.query(
    `
    UPDATE projects
    SET name = $1,
        repo_url = $2,
        webhook_secret = $3,
        default_branch = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
    `,
    [name, repo_url, webhook_secret, default_branch, id],
  );

  return rows[0];
};

export const deleteProjectById = async (id) => {
  await pool.query(`DELETE FROM projects WHERE id = $1`, [id]);
};
