// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmail } from "../redux/EmailContext"; // Import the custom Email context
import "../styles/styles.css";

const LoginPage = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { email, setEmail } = useEmail(); // Retrieve email and setEmail from context
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState(""); // State for handling errors

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear any previous errors

    // Basic validation for email and password fields
    if (!email) return setError("Email is required");
    if (!password) return setError("Password is required");

    try {
      // Send login credentials to the server
      const response = await fetch("http://localhost:3002/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Convert email and password to JSON
      });

      const data = await response.json(); // Parse server response

      if (response.ok) {
        // If the login is successful, navigate to the SignUp page
        navigate("/SignUp");
      } else {
        // Handle unsuccessful login
        setError(data.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Handle errors during the fetch request
      console.error("Error:", error.message);
      setError("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Log in</h2>
      <form onSubmit={handleSubmit}>
        {/* Display error message if any */}
        {error && <p className="error">{error}</p>}
        <div>
          <label htmlFor="useremail">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit">Log in</button>
        <p>
          {/* Navigate to other pages */}
          <button onClick={() => navigate("/SignUp")}>Do you want to have an account?</button>
          <button onClick={() => navigate("/LoginPageEmail")}>Forgot your password?</button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
