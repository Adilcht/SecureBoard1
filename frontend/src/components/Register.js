import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  useEffect(() => {
    // Calcul de la force du mot de passe
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      console.log("✅ Backend response:", res.data);
      setMessage("✅ Inscription réussie ! Redirection...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(err.response?.data || err);
      setMessage("❌ Échec de l'inscription !");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return "#4caf50";
    if (passwordStrength >= 50) return "#ff9800";
    if (passwordStrength >= 25) return "#ff5722";
    return "#f44336";
  };

  return (
    <div className="register-container">
      <div className={`register-background ${fadeIn ? 'fade-in' : ''}`}>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className={`register-card ${fadeIn ? 'slide-up' : ''}`}>
        <div className="register-header">
          <div className="logo-container">
            <div className="logo-icon">
              <div className="logo-square"></div>
              <div className="logo-line"></div>
            </div>
            <h1 className="logo-text">Secure<span>Board</span></h1>
          </div>
          <p className="register-subtitle">Rejoignez notre plateforme</p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="register-input"
            />
            <div className="input-underline"></div>
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="register-input"
            />
            <div className="input-underline"></div>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="register-input"
            />
            <div className="input-underline"></div>
            {password && (
              <div className="password-strength">
                <div 
                  className="strength-bar"
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: getPasswordStrengthColor()
                  }}
                ></div>
                <span className="strength-text">
                  {passwordStrength >= 75 ? "Fort" : 
                   passwordStrength >= 50 ? "Moyen" : 
                   passwordStrength >= 25 ? "Faible" : "Très faible"}
                </span>
              </div>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={passwordConfirmation}
              onChange={e => setPasswordConfirmation(e.target.value)}
              required
              className="register-input"
            />
            <div className="input-underline"></div>
            {passwordConfirmation && password !== passwordConfirmation && (
              <div className="password-match error">⚠️ Les mots de passe ne correspondent pas</div>
            )}
            {passwordConfirmation && password === passwordConfirmation && (
              <div className="password-match success">✓ Les mots de passe correspondent</div>
            )}
          </div>

          <button 
            type="submit" 
            className={`register-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || password !== passwordConfirmation}
          >
            {isLoading ? (
              <div className="button-loader">
                <div className="loader-dot"></div>
                <div className="loader-dot"></div>
                <div className="loader-dot"></div>
              </div>
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : 'success'} ${fadeIn ? 'fade-in' : ''}`}>
            {message}
          </div>
        )}

        <div className="register-footer">
          <p className="login-link">
            Déjà un compte ? <Link to="/login" className="link">Se connecter</Link>
          </p>
          <p className="copyright">© 2024 SecureBoard. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}