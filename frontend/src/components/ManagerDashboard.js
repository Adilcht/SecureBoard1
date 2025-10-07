import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export default function ManagerDashboard() {
  const [manager, setManager] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [adminErrors, setAdminErrors] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Manager data
        const managerRes = await axios.get(`${API_URL}/manager-connected`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setManager(managerRes.data);

        // Admins list
        const adminsRes = await axios.get(`${API_URL}/all-admins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(adminsRes.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Delete admin
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await axios.delete(`${API_URL}/delete-admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(admins.filter((a) => a.id !== id));
      alert("Admin deleted ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to delete admin ❌");
    }
  };

  // Update admin
  const handleUpdateAdmin = async (id, updatedAdmin) => {
    try {
      const res = await axios.put(`${API_URL}/update-admin/${id}`, updatedAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(admins.map((a) => (a.id === id ? res.data.admin : a)));
      setEditingAdmin(null);
      alert("Admin updated ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to update admin ❌");
    }
  };

  // Create admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    // Basic validation
    const errors = {};
    if (!newAdmin.name) errors.name = "Name required";
    if (!newAdmin.email) errors.email = "Email required";
    if (!newAdmin.password) errors.password = "Password required";
    if (newAdmin.password !== newAdmin.password_confirmation)
      errors.password_confirmation = "Passwords do not match";

    setAdminErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await axios.post(`${API_URL}/create-admin`, newAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins([...admins, res.data.admin]);
      setNewAdmin({ name: "", email: "", password: "", password_confirmation: "" });
      alert("Admin created ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to create admin ❌");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Manager Dashboard</h1>
      <p>Name: {manager.name}</p>
      <p>Email: {manager.email}</p>

      <h2>Admins</h2>
      <form onSubmit={handleCreateAdmin}>
        <input
          type="text"
          placeholder="Name"
          value={newAdmin.name}
          onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
        />
        {adminErrors.name && <span>{adminErrors.name}</span>}
        <input
          type="email"
          placeholder="Email"
          value={newAdmin.email}
          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
        />
        {adminErrors.email && <span>{adminErrors.email}</span>}
        <input
          type="password"
          placeholder="Password"
          value={newAdmin.password}
          onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
        />
        {adminErrors.password && <span>{adminErrors.password}</span>}
        <input
          type="password"
          placeholder="Confirm Password"
          value={newAdmin.password_confirmation}
          onChange={(e) =>
            setNewAdmin({ ...newAdmin, password_confirmation: e.target.value })
          }
        />
        {adminErrors.password_confirmation && <span>{adminErrors.password_confirmation}</span>}
        <button type="submit">Create Admin</button>
      </form>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td>
                {editingAdmin === a.id ? (
                  <input
                    value={a.name}
                    onChange={(e) =>
                      setAdmins(admins.map((x) => (x.id === a.id ? { ...x, name: e.target.value } : x)))
                    }
                  />
                ) : (
                  a.name
                )}
              </td>
              <td>
                {editingAdmin === a.id ? (
                  <input
                    value={a.email}
                    onChange={(e) =>
                      setAdmins(admins.map((x) => (x.id === a.id ? { ...x, email: e.target.value } : x)))
                    }
                  />
                ) : (
                  a.email
                )}
              </td>
              <td>
                {editingAdmin === a.id ? (
                  <>
                    <button onClick={() => handleUpdateAdmin(a.id, a)}>Save</button>
                    <button onClick={() => setEditingAdmin(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingAdmin(a.id)}>Edit</button>
                    <button onClick={() => handleDeleteAdmin(a.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
