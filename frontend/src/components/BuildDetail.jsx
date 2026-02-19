import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";

const BuildDetail = () => {
  const { id } = useParams();
  const [build, setBuild] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchBuild = async () => {
      const { data } = await api.get(`/builds/${id}`);
      setBuild(data);
      if (data.logs) {
        setLogs(data.logs.split("\n"));
      }
    };

    fetchBuild();

    // Poll every 3 seconds to get updated status/logs
    const interval = setInterval(fetchBuild, 3000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("WS connected");
      // VERY IMPORTANT
      ws.send(JSON.stringify({ buildId: id }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS message:", data);
      if (data.log) {
        setLogs((prev) => [...prev, data.log]);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => ws.close();
  }, [id]);

  if (!build) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Build #{build.id}</h1>

      <div className="mb-4">
        <span
          className={`px-3 py-1 rounded text-white text-sm ${
            build.status === "success"
              ? "bg-green-500"
              : build.status === "failed"
                ? "bg-red-500"
                : build.status === "running"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-gray-500"
          }`}
        >
          {build.status}
        </span>
        <p>Commit: {build.commit_hash}</p>
        <p>Branch: {build.branch}</p>
      </div>

      <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
        {logs.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
};

export default BuildDetail;
