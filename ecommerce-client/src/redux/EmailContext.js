// src/context/EmailContext.js
import React, { createContext, useState, useContext } from "react";

// Create the EmailContext
export const EmailContext = createContext();

// EmailProvider Component
export const EmailProvider = ({ children }) => {
  // State to store the email value
  const [email, setEmail] = useState("");

  return (
    <EmailContext.Provider value={{ email, setEmail }}>
      {/* Wrapping the children components with the EmailContext provider */}
      {children}
    </EmailContext.Provider>
  );
};

// Custom Hook to use the email context
export const useEmail = () => {
  // Getting the context value
  const context = useContext(EmailContext);
  
  // If the context is not used within an EmailProvider, throw an error
  if (!context) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  
  // Return the context value (email and setEmail function)
  return context;
};
