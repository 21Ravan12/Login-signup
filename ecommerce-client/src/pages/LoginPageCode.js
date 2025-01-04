import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmail } from "../redux/EmailContext";
import "../styles/styles.css";

const LoginPageCode = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { email } = useEmail(); // Retrieve the email from context
  const [code, setCode] = useState(""); // State for the code input
  const [error, setError] = useState(""); // State for handling errors

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Input validation
    if (!code) {
      setError("Please fill in all fields"); // Set error message if the code is missing
      return;
    }

    try {
      // Send the verification code and email to the server
      const response = await fetch("http://localhost:3002/api/recovery/password/second", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code, // Send the code entered by the user
          email, // Include the email from context
        }),
      });

      const data = await response.json(); // Parse the server response

      if (response.ok) {
        // Navigate to the password change page if successful
        navigate("/LoginPageChangeCode");
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
      <h2>Identification code</h2>
      <form onSubmit={handleSubmit}>
        {/* Display error messages */}
        {error && <p className="error">{error}</p>}
        <div>
          <label htmlFor="code">Code:</label>
          <input
            type="number"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)} // Update the code state
            required
          />
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default LoginPageCode;
