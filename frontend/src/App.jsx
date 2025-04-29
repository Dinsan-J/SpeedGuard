import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import Landing from "./pages/Landing";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
