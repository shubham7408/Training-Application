import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const ChangePass = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user.email;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password length validation
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Reset error messages
    setError("");
    setPasswordError("");

    try {
      const payload = {
        username: email,
        password: newPassword,
      };
      const response = await axios.post(`${import.meta.env.VITE_URL}/api/changepassword`, payload);
      if (response.status === 200) {
        toast.success("Password changed successfully!");
        console.log("Password changed successfully!");
      } else {
        setError("Failed to change password.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while changing the password.");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-8" data-aos="fade-right">
      <div className="py-8">
        <div className="mb-6">
          <center>
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">
              Change Your Password
            </h2>
          </center>
          <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-md font-semibold text-gray-700"
                >
                  New Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-600" />
                    ) : (
                      <FaEye className="text-gray-600" />
                    )}
                  </button>
                </div>
                {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-md font-semibold text-gray-700"
                >
                  Confirm New Password:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                    placeholder="Re-enter your new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="text-gray-600" />
                    ) : (
                      <FaEye className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePass;