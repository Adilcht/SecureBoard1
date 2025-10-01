import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true; // ⚠️ important

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ récupérer CSRF cookie
      await axios.get(`${API_URL.replace("/api", "")}/sanctum/csrf-cookie`);

      // 2️⃣ envoyer le register
      await axios.post(`${API_URL}/register`, form);
      alert("✅ Registered successfully! Please login.");
      navigate("/"); // redirection vers login
    } catch (err) {
      console.error(err.response?.data);
      alert("❌ Error registering user: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <input type="password" name="password_confirmation" placeholder="Confirm Password" onChange={handleChange} />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
