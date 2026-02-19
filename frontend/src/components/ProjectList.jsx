import { useEffect, useState } from "react";
import api from "../services/api.js";
import { Link } from "react-router-dom";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  const createProject = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", { name, repo_url: repoUrl });

      setName("");
      setRepoUrl("");

      await fetchProjects(); // cleaner reuse
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };
  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/projects");
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };
    fetchProjects();
  }, []);

  // const handleRefreshProjects = async () => {
  //   try {
  //     const { data } = await api.get("/projects");
  //     setProjects(data);
  //   } catch (error) {
  //     console.error("Failed to fetch projects", error);
  //   }
  // };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>

      {/* Create Project Form */}
      <form
        onSubmit={createProject}
        className="mb-8 bg-gray-100 p-4 rounded-lg shadow"
      >
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-1/3"
            required
          />

          <input
            type="text"
            placeholder="Repo URL"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="border p-2 rounded w-2/3"
            required
          />

          <button type="submit" className="bg-blue-600 text-white px-4 rounded">
            Create
          </button>
        </div>
      </form>

      {/* Projects Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Repository</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="p-3 font-medium">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="p-3 text-blue-600 break-all">
                  {project.repo_url}
                </td>
                <td className="p-3">
                  {new Date(project.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {projects.length === 0 && (
          <div className="p-4 text-gray-500">No projects found.</div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
