import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmail } from "../redux/EmailContext";

const SignupPageCode = () => {
  // useNavigate hook is used to programmatically navigate the user after successful form submission
  const navigate = useNavigate();
  
  // Getting the email from the EmailContext for sending with the verification code
  const { email } = useEmail(); 
  
  // States for storing the input code and error messages
  const [code, setCode] = useState(""); 
  const [error, setError] = useState(""); 

  // Function that handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Input validation: check if the code field is empty
    if (!code) {
      setError("Please fill in all fields"); // Set error if code is not entered
      return;
    }

    try {
      // Sending a POST request to the backend API with the code and email
      const response = await fetch("http://localhost:3002/api/enter/end", {
        method: "POST", // HTTP method
        headers: {
          "Content-Type": "application/json", // Ensuring the request body is JSON
        },
        body: JSON.stringify({
          code,  // Passing the entered code
          email  // Passing the email from context
        }),
      });

      const data = await response.json(); // Parsing the JSON response

      if (response.ok) {
        navigate("/"); // If the response is OK, navigate to the home page
      } else {
        // Display error message from the API or a default error
        setError(data.message || "Something went wrong!");
      }
    } catch (error) {
      // Handling any errors that occur during the request
      console.error("Error:", error.message);
      //setError("Failed to connect to the server. Please try again."); // Optionally handle server connection errors
    }
  };

  return (
    <div className="signup-container">
      <h2>Identification code</h2>
      <form onSubmit={handleSubmit}>
        {/* Display error message if there's an error */}
        {error && <p className="error">{error}</p>}
        
        <div>
          <label htmlFor="code">Code:</label>
          <input
            type="number" // Input type is number for the code
            id="code"
            value={code} // The value of the input is controlled by the code state
            onChange={(e) => setCode(e.target.value)} // Update the state when the input changes
            required // Make sure the input is filled before submitting
          />
        </div>
        
        {/* Submit button */}
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default SignupPageCode;
