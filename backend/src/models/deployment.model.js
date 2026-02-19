import pool from "../config/db.js";

export const createDeployment = async (buildId, projectId, environment) => {
  const { rows } = await pool.query(
    `INSERT INTO deployments (build_id, project_id, environment)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [buildId, projectId, environment],
  );

  return rows[0];
};

export const updateStatus = async (id, status, containerId = null) => {
  if (containerId) {
    const { rows } = await pool.query(
      `UPDATE deployments
       SET status = $1, container_id = $2, deployed_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, containerId, id],
    );
    return rows[0];
  }

  const { rows } = await pool.query(
    `UPDATE deployments
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, id],
  );
  return rows[0];
};

export const findByProjectId = async (projectId) => {
  const { rows } = await pool.query(
    `SELECT * FROM deployments
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [projectId],
  );

  return rows;
};

export const findLatestSuccessful = async (projectId) => {
  const { rows } = await pool.query(
    `SELECT * FROM deployments
     WHERE project_id = $1 AND status = 'success'
     ORDER BY deployed_at DESC
     LIMIT 1`,
    [projectId],
  );

  return rows[0];
};

export const markRolledBack = async (id) => {
  await pool.query(
    `UPDATE deployments
     SET status = 'rolled_back',
         rolled_back_at = NOW()
     WHERE id = $1`,
    [id],
  );
};
