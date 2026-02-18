import pool from "../config/db.js";

export const createBuild = async (projectId, commitHash, branch, message) => {
  const result = await pool.query(
    `INSERT INTO builds (project_id, commit_hash, branch, commit_message, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [projectId, commitHash, branch, message],
  );

  return result.rows[0];
};
