import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom"; // ✅ import pour la redirection

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ✅ hook pour naviguer

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      console.log("✅ Backend response:", res.data);
      setMessage("✅ Registered successfully!");

      // ✅ Redirige vers la page de login après 1 seconde
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      console.error(err.response?.data || err);
      setMessage("❌ Registration failed!");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={passwordConfirmation}
          onChange={e => setPasswordConfirmation(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
