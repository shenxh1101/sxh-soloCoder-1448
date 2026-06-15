
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import StudentDetail from "@/pages/Students/StudentDetail";
import Checkin from "@/pages/Checkin";
import Statistics from "@/pages/Statistics";
import ExportPage from "@/pages/Export";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/export" element={<ExportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
