import { Routes, Route } from "react-router-dom";
import ProjectList from "./components/ProjectList.jsx";
import ProjectDetail from "./components/ProjectDetail.jsx";
import BuildDetail from "./components/BuildDetail.jsx";
function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectList />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/builds/:id" element={<BuildDetail />} />
    </Routes>
  );
}

export default App;
