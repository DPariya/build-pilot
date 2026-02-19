import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import { Link } from "react-router-dom";

const ProjectDetail = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [builds, setBuilds] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [rollbackLoadingId, setRollbackLoadingId] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const projectRes = await api.get(`/projects/${id}`);
        const buildsRes = await api.get(`/projects/${id}/builds`);
        const deploymentsRes = await api.get(`/deployments/${id}/deployments`);

        setProject(projectRes.data);
        setBuilds(buildsRes.data);
        setDeployments(deploymentsRes.data);
      } catch (error) {
        console.error("Failed to fetch project detail", error);
      }
    };

    fetchData();
  }, [id]);

  const retryBuild = async (buildId) => {
    try {
      await api.post(`/builds/${buildId}/retry`);
      // Refresh builds
      const buildsRes = await api.get(`/projects/${id}/builds`);
      setBuilds(buildsRes.data);
    } catch (error) {
      console.error("Retry failed", error);
    }
  };

  const rollback = async (deploymentId) => {
    try {
      setRollbackLoadingId(deploymentId);

      await api.post(`/deployments/${deploymentId}/rollback`);
      const deploymentsRes = await api.get(`/deployments/${id}/deployments`);
      setDeployments(deploymentsRes.data);
    } catch (error) {
      console.error("Rollback failed", error);
    } finally {
      setRollbackLoadingId(null);
    }
  };
  if (!project) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
      <p className="text-gray-600 mb-8">{project.repo_url}</p>

      {/* Builds */}
      <h2 className="text-xl font-semibold mb-3">Build History</h2>
      <div className="bg-white shadow rounded-lg mb-8">
        {builds.map((build) => (
          <div
            key={build.id}
            className="flex justify-between items-center p-4 border-b"
          >
            <div>
              <Link
                to={`/builds/${build.id}`}
                className="text-blue-600 hover:underline"
              >
                <p>Commit: {build.commit_hash}</p>
              </Link>
              <p>Branch: {build.branch}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded text-white text-sm ${
                  build.status === "success"
                    ? "bg-green-500"
                    : build.status === "failed"
                      ? "bg-red-500"
                      : build.status === "running"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                }`}
              >
                {build.status}
              </span>

              {/* Retry Button (only if failed) */}
              {build.status === "failed" && (
                <button
                  onClick={() => retryBuild(build.id)}
                  className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Deployments */}
      <h2 className="text-xl font-semibold mb-3">Deployments</h2>
      <div className="bg-white shadow rounded-lg">
        {deployments.map((dep) => {
          const successfulDeployments = deployments.filter(
            (d) => d.status === "success",
          );
          return (
            <div
              key={dep.id}
              className="flex justify-between items-center p-4 border-b"
            >
              <div>
                <p>Environment: {dep.environment}</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded text-white text-sm ${
                    dep.status === "success"
                      ? "bg-green-500"
                      : dep.status === "failed"
                        ? "bg-red-500"
                        : dep.status === "rolled_back"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                  }`}
                >
                  {dep.status}
                </span>
                {dep.status === "rolled_back" && dep.rolled_back_at && (
                  <span className="text-xs text-gray-500">
                    Rolled back at{" "}
                    {new Date(dep.rolled_back_at).toLocaleString()}
                  </span>
                )}
                {dep.status === "success" &&
                  successfulDeployments.length > 1 && (
                    <button
                      onClick={() => rollback(dep.id)}
                      disabled={rollbackLoadingId === dep.id}
                      className={`px-3 py-1 rounded text-sm text-white ${
                        rollbackLoadingId === dep.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {rollbackLoadingId === dep.id
                        ? "Rolling back..."
                        : "Rollback"}
                    </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDetail;
