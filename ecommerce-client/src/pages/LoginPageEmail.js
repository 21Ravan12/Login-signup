// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmail } from "../redux/EmailContext";
import "../styles/styles.css"; // Import CSS file for styling

const LoginPageEmail = () => {
  const navigate = useNavigate(); // Hook for navigation between pages
  const { email, setEmail } = useEmail(); // Access email state from context
  const [error, setError] = useState(""); // State to handle errors

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors

    // Validate email input
    if (!email) return setError("Email is required");

    try {
      // Send the email to the server for password recovery
      const response = await fetch("http://localhost:3002/api/recovery/password/first", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // Send the email as part of the request body
        }),
      });

      const data = await response.json(); // Parse the response data

      if (response.ok) {
        // Navigate to the code input page on success
        navigate("/LoginPageCode");
      } else {
        // Handle errors from the server response
        setError(data.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Handle network or unexpected errors
      console.error("Error:", error.message);
      setError("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Change password</h2>
      <form onSubmit={handleSubmit}>
        {/* Display error messages */}
        {error && <p className="error">{error}</p>}
        <div>
          <label htmlFor="useremail">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value); // Update email state
              setError(""); // Clear any errors on input change
            }}
            placeholder="Enter your email" // Placeholder for input
            required // Ensure the field is required
          />
        </div>
        <button type="submit">Send code</button>
        <p>
          <button onClick={() => navigate("/")}>Do you remember your code?</button>
        </p>
      </form>
    </div>
  );
};

export default LoginPageEmail;
