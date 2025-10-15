import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });

      // Sauvegarde du token et du rôle
      localStorage.setItem("token", res.data.token);
      const role = res.data.user.roles[0]?.name || "user";
      localStorage.setItem("role", role);

      setMessage("✅ Connexion réussie !");
      
      // Animation avant redirection
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "manager") {
          navigate("/manager");
        } else {
          navigate("/user");
        }
      }, 1000);

    } catch (err) {
      console.error(err.response?.data || err);
      setMessage("❌ Échec de la connexion !");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className={`login-background ${fadeIn ? 'fade-in' : ''}`}>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className={`login-card ${fadeIn ? 'slide-up' : ''}`}>
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <div className="logo-square"></div>
              <div className="logo-line"></div>
            </div>
            <h1 className="logo-text">Secure<span>Board</span></h1>
          </div>
          <p className="login-subtitle">Gestion de projets sécurisée</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
            <div className="input-underline"></div>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
            <div className="input-underline"></div>
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="button-loader">
                <div className="loader-dot"></div>
                <div className="loader-dot"></div>
                <div className="loader-dot"></div>
              </div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {/* Lien vers la page d'inscription */}
        <div className="register-link">
          <p>Vous n'avez pas de compte ? <Link to="/register" className="link">Créer un compte</Link></p>
        </div>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : 'success'} ${fadeIn ? 'fade-in' : ''}`}>
            {message}
          </div>
        )}

        <div className="login-footer">
          <p>© 2026 SecureBoard. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}