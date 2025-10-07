import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States pour édition utilisateur
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState({ name: "", email: "" });

  // State pour création de projet
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    status: "pending",
    assigned_to: "", // ✅ ajouté
  });
  const [projectMessage, setProjectMessage] = useState("");

  const token = localStorage.getItem("token");

  // Charger admin + users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const adminRes = await axios.get(`${API_URL}/admin-connected`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(adminRes.data);

        const usersRes = await axios.get(`${API_URL}/all-users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersRes.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // ✅ Créer un projet avec assignation
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setProjectMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/create-project`,
        {
          title: projectData.title,
          description: projectData.description,
          status: projectData.status,
          assigned_to: projectData.assigned_to, // ✅ ajouté
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProjectMessage("✅ Project created and user assigned successfully!");
      setProjectData({
        title: "",
        description: "",
        status: "pending",
        assigned_to: "",
      });
      console.log("New Project:", res.data.project);
    } catch (err) {
      console.error(err);
      setProjectMessage("❌ Failed to create project");
    }
  };

  // DELETE user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.id !== id));
      alert("User deleted ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user ❌");
    }
  };

  // UPDATE user
  const handleUpdateUser = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/update-user/${id}`, editingUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.map((u) => (u.id === id ? res.data.user : u)));
      setEditingUserId(null);
      alert("User updated ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to update user ❌");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>
        <strong>Name:</strong> {admin.name}
      </p>
      <p>
        <strong>Email:</strong> {admin.email}
      </p>

      {/* ---- Formulaire création de projet ---- */}
      <h2>Create Project</h2>
      <form onSubmit={handleCreateProject}>
        <div>
          <label>Title: </label>
          <input
            type="text"
            value={projectData.title}
            onChange={(e) =>
              setProjectData({ ...projectData, title: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label>Description: </label>
          <textarea
            value={projectData.description}
            onChange={(e) =>
              setProjectData({ ...projectData, description: e.target.value })
            }
          />
        </div>

        <div>
          <label>Status: </label>
          <select
            value={projectData.status}
            onChange={(e) =>
              setProjectData({ ...projectData, status: e.target.value })
            }
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* ✅ Champ pour assigner un utilisateur */}
        <div>
          <label>Assign To User: </label>
          <select
            value={projectData.assigned_to}
            onChange={(e) =>
              setProjectData({ ...projectData, assigned_to: e.target.value })
            }
            required
          >
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Create Project</button>
      </form>

      {projectMessage && <p>{projectMessage}</p>}

      {/* ---- Liste des utilisateurs ---- */}
      <h2>Users</h2>
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  {editingUserId === u.id ? (
                    <input
                      type="text"
                      value={editingUserData.name}
                      onChange={(e) =>
                        setEditingUserData({
                          ...editingUserData,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td>
                  {editingUserId === u.id ? (
                    <input
                      type="email"
                      value={editingUserData.email}
                      onChange={(e) =>
                        setEditingUserData({
                          ...editingUserData,
                          email: e.target.value,
                        })
                      }
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td>
                  {editingUserId === u.id ? (
                    <>
                      <button onClick={() => handleUpdateUser(u.id)}>Save</button>
                      <button onClick={() => setEditingUserId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingUserId(u.id);
                          setEditingUserData({ name: u.name, email: u.email });
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
