// HomeButton.jsx
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react"; // Optional icon library

const HomeButton = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/"); // Redirect to landing page
  };

  return (
    <button
      onClick={handleHomeClick}
      className="fixed top-4 left-4 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
    >
      <Home className="w-6 h-6" />
    </button>
  );
};

export default HomeButton;
