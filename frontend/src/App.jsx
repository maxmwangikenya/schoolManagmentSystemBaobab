import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdmnDashboard from "./pages/AdmnDashboard"; // Make sure to import this

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admn-dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admn-dashboard" element={<AdmnDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;