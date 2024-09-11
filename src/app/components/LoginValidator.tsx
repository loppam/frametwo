"use client";
import React from "react";
import ImageCont from "./ImageCont";
import ArtForm from "./ArtForm";
import LoginForm from "./LoginForm"; // Import LoginForm
import ArtPage from "./ArtPage";
import { useState } from "react";

const LoginValidator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // This triggers after successful login
  };

  return (
    <div>
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div>
          <ArtPage />
        </div>
      )}
    </div>
  );
};

export default LoginValidator;
