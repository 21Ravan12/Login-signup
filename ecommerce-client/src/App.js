import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // Importing React Router components
import { EmailProvider } from "./redux/EmailContext"; // Import the EmailProvider to provide email context
import LoginPage from "./pages/LoginPage"; // Import LoginPage component
import SignUp from "./pages/SignUp"; // Import SignUp component
import SignUpCode from "./pages/SignUpCode"; // Import SignUpCode component
import LoginPageEmail from "./pages/LoginPageEmail"; // Import LoginPageEmail component
import LoginPageCode from "./pages/LoginPageCode"; // Import LoginPageCode component
import LoginPageChangeCode from "./pages/LoginPageChangeCode"; // Import LoginPageChangeCode component

function App() {
  return (
    <EmailProvider> {/* Wrapping the entire app with EmailProvider to make email state available throughout */}
      <Router>
        <div>
          {/* Navigation Links (These are hidden with style={{ display: "none" }} for now) */}
          <nav style={{ display: "none" }}>
            <Link to="/">Login Page</Link>
            <Link to="/SignUp">Sign Up</Link>
            <Link to="/SignUpCode">Sign Up Code</Link>
          </nav>

          {/* Defining Routes for different pages */}
          <Routes>
            <Route path="/" element={<LoginPage />} /> {/* Main Login Page */}
            <Route path="/SignUp" element={<SignUp />} /> {/* Sign Up Page */}
            <Route path="/SignUpCode" element={<SignUpCode />} /> {/* Sign Up Code Page */}
            <Route path="/LoginPageEmail" element={<LoginPageEmail />} /> {/* Login Page Email */}
            <Route path="/LoginPageCode" element={<LoginPageCode />} /> {/* Login Page with Code */}
            <Route path="/LoginPageChangeCode" element={<LoginPageChangeCode />} /> {/* Login Page with Change Code */}
          </Routes>
        </div>
      </Router>
    </EmailProvider>
  );
}

export default App;
