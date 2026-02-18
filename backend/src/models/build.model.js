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

export const findByProjectId = async function (projectId) {
  const { rows } = await pool.query(
    `
    SELECT * FROM builds
    WHERE project_id = $1
    ORDER BY created_at DESC
    `,
    [projectId],
  );
  return rows;
};

export const findById = async function (id) {
  const { rows } = await pool.query(`SELECT * FROM builds WHERE id = $1`, [id]);
  return rows[0];
};
