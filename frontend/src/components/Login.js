import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      // save token + user
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // détecter le rôle
      const role = response.data.user.roles[0]?.name;

      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "manager") {
        window.location.href = "/manager";
      } else {
        window.location.href = "/user";
      }
    } catch (error) {
      console.error(error.response?.data || error);
      alert("❌ Identifiants invalides");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Connexion</h2>
          <p>Bienvenue! Veuillez vous connecter à votre compte.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
              <span 
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Pas de compte? <a href="/register">Créer un compte</a></p>
        </div>
      </div>
      
      <div className="login-decoration">
        <div className="decoration-circle-1"></div>
        <div className="decoration-circle-2"></div>
        <div className="decoration-circle-3"></div>
      </div>
    </div>
  );
};

export default Login;
