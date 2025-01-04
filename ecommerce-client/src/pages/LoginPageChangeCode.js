import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmail } from "../redux/EmailContext";

const LoginPageChangeCode = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { email } = useEmail(); // Retrieve the email from context
  const [password, setPassword] = useState(""); // State for new password
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirming new password
  const [error, setError] = useState(""); // State for handling errors

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Input validation
    if (!password) return setError("Password is required"); // Check if password is empty
    if (!confirmPassword) return setError("Please confirm your password"); // Check if confirmation password is empty
    if (password !== confirmPassword) return setError("Passwords do not match"); // Check if passwords match

    try {
      // Send the password update request to the API
      const response = await fetch("http://localhost:3002/api/recovery/password/third", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password, // Send the new password
          email, // Include the email from context
        }),
      });

      const data = await response.json(); // Parse the response from the server

      if (response.ok) {
        // Reset the form on successful password change
        setPassword("");
        setConfirmPassword("");
        navigate("/"); // Redirect to the homepage
      } else {
        // Display the error message returned by the API
        setError(data.message || "Something went wrong!");
      }
    } catch (error) {
      // Handle errors during the API request
      console.error("Error:", error.message);
      setError("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Change code</h2>
      <form onSubmit={handleSubmit}>
        {/* Display error messages */}
        {error && <p className="error">{error}</p>}
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value); // Update password state
              setError(""); // Clear the error message
            }}
            placeholder="Enter your password"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value); // Update confirmPassword state
              setError(""); // Clear the error message
            }}
            placeholder="Confirm your password"
            required
          />
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default LoginPageChangeCode;
