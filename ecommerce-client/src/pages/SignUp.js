import React, { useState } from "react";
import { useEmail } from "../redux/EmailContext";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { email, setEmail } = useEmail(); // Access email context
  const [password, setPassword] = useState(""); // State for password
  const [name, setUsername] = useState(""); // State for username
  const [birthyear, setBirthyear] = useState(""); // State for birth year
  const [confirmPassword, setConfirmPassword] = useState(""); // State for password confirmation
  const [error, setError] = useState(""); // State for error messages

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors

    // Input validation
    if (!name) return setError("Username is required");
    if (!email) return setError("Email is required");
    if (!password) return setError("Password is required");
    if (!confirmPassword) return setError("Please confirm your password");
    if (!birthyear) return setError("Birth year is required");
    if (password !== confirmPassword) return setError("Passwords do not match");

    try {
      // Send form data to the server
      const response = await fetch("http://localhost:3002/api/enter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          birthyear: parseInt(birthyear), // Convert birth year to an integer
        }),
      });

      const data = await response.json(); // Parse the response

      if (response.ok) {
        // Handle success
        setPassword("");
        setConfirmPassword("");
        setUsername("");
        setBirthyear("");
        navigate("/SignUpCode"); // Redirect to confirmation page
      } else {
        // Handle server-side errors
        setError(data.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Handle network or unexpected errors
      console.error("Error:", error.message);
      setError("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {/* Display error messages */}
        {error && <p className="error">{error}</p>}
        
        {/* Username input */}
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={name}
            onChange={(e) => {
              setUsername(e.target.value); // Update username state
              setError(""); // Clear errors on change
            }}
            placeholder="Enter your username"
            required
          />
        </div>
        
        {/* Email input */}
        <div>
          <label htmlFor="useremail">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value); // Update email state
              setError(""); // Clear errors on change
            }}
            placeholder="Enter your email"
            required
          />
        </div>
        
        {/* Birth year input */}
        <div>
          <label htmlFor="birthyear">Birthyear:</label>
          <input
            type="number"
            id="birthyear"
            value={birthyear}
            onChange={(e) => {
              setBirthyear(e.target.value); // Update birth year state
              setError(""); // Clear errors on change
            }}
            placeholder="Enter your birth year"
            required
          />
        </div>
        
        {/* Password input */}
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value); // Update password state
              setError(""); // Clear errors on change
            }}
            placeholder="Enter your password"
            required
          />
        </div>
        
        {/* Confirm password input */}
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value); // Update confirm password state
              setError(""); // Clear errors on change
            }}
            placeholder="Confirm your password"
            required
          />
        </div>
        
        {/* Submit button */}
        <button type="submit">Sign Up</button>
        
        {/* Navigation link */}
        <p>
          <button onClick={() => navigate("/")}>Already have an account?</button>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
