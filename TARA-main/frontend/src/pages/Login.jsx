import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";
import { useProjectContext } from "../contextapi/allcontext";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Developer");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { login } = useProjectContext();
  useEffect(() => {
    if (isLoggedIn) {
      window.reload();
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email + "@innoasr.com",
          // role: role,
          password: password + role,
        }),
      });

      const responseText = await response.text();

      if (response.ok) {
        console.log("Login successful:", responseText);

        const user1 = {
          email: email + "@innoasr.com",
          role: role,
        };

        login(user1);
        window.location.reload();
        navigate("/");
      } else if (response.status === 401) {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        setError(responseText || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {error && <p className="text-blue-500 text-center">{error}</p>}
        <div className="space-y-4">
          <div className="relative">
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-24 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="absolute right-3 top-2 text-gray-500">
                @innoasr.com
              </span>
            </div>
          </div>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="Developer">Developer</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Admin">Admin</option>
              </select>
              <FaUserCircle className="absolute top-3 left-3 text-gray-400" />
              <FaChevronDown className="absolute top-3 right-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
