import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });

      // Sauvegarde du token et du rôle
      localStorage.setItem("token", res.data.token);
      const role = res.data.user.roles[0]?.name || "user";
      localStorage.setItem("role", role);

      setMessage("✅ Login successful!");

      // Redirection selon le rôle
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "manager") {
        navigate("/manager");
      } else {
        navigate("/user");
      }

    } catch (err) {
      console.error(err.response?.data || err);
      setMessage("❌ Login failed!");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: "10px" }}
        />
        <button type="submit" style={{ width: "100%" }}>
          Login
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}
