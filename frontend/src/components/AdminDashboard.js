import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  // ✅ Création d'utilisateur
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [userMessage, setUserMessage] = useState("");
  const [userErrors, setUserErrors] = useState({});

  // ✅ Création de projet
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    status: "pending",
    assigned_to: "",
  });
  const [projectMessage, setProjectMessage] = useState("");
  const [projectErrors, setProjectErrors] = useState({});

  // ✅ Listes
  const [projects, setProjects] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState({ name: "", email: "" });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectData, setEditingProjectData] = useState({
    title: "",
    description: "",
    status: "pending",
  });

  const token = localStorage.getItem("token");

  // 🔹 Charger admin et users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [adminRes, usersRes, projectsRes] = await Promise.all([
          axios.get(`${API_URL}/admin-connected`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/all-users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setAdmin(adminRes.data);
        setUsers(usersRes.data);
        setProjects(projectsRes.data.projects || []);

      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    pending: projects.filter(p => p.status === 'pending').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalUsers: users.length,
  };

  // ✅ Logout
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Logout failed ❌");
    }
  };

  // ✅ Créer un utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMessage("");
    const errors = {};

    if (!newUser.name) errors.name = "Name required";
    if (!newUser.email) errors.email = "Email required";
    if (!newUser.password) errors.password = "Password required";
    if (newUser.password !== newUser.password_confirmation)
      errors.password_confirmation = "Passwords do not match";

    setUserErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await axios.post(`${API_URL}/create-user`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers([...users, res.data.user]);
      setUserMessage("✅ User created successfully!");
      setNewUser({ name: "", email: "", password: "", password_confirmation: "" });
    } catch (err) {
      console.error(err);
      setUserMessage("❌ Error creating user");
    }
  };

  // ✅ Créer un projet
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setProjectMessage("");
    const errors = {};

    if (!projectData.title) errors.title = "Title required";
    if (!projectData.assigned_to) errors.assigned_to = "Please assign to a user";

    setProjectErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await axios.post(`${API_URL}/create-project`, projectData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects([...projects, res.data.project]);
      setProjectMessage("✅ Project created successfully!");
      setProjectData({ title: "", description: "", status: "pending", assigned_to: "" });
    } catch (err) {
      console.error(err);
      setProjectMessage("❌ Error creating project");
    }
  };

  // ✅ Supprimer utilisateur
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting user");
    }
  };

  // ✅ Modifier utilisateur
  const handleUpdateUser = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/update-user/${id}`, editingUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.map((u) => (u.id === id ? res.data.user : u)));
      setEditingUserId(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error updating user");
    }
  };

  // ✅ Supprimer projet
  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await axios.delete(`${API_URL}/delete-project/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Modifier projet
  const handleUpdateProject = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/update-project/${id}`, editingProjectData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.map((p) => (p.id === id ? res.data.project : p)));
      setEditingProjectId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Render sections
  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome back, {admin?.name}!</h1>
        <p>Here's an overview of your platform.</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><i className="fas fa-users"></i></div>
          <div className="stat-info"><h3>{projectStats.totalUsers}</h3><p>Total Users</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress"><i className="fas fa-folder"></i></div>
          <div className="stat-info"><h3>{projectStats.total}</h3><p>Total Projects</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><i className="fas fa-sync-alt"></i></div>
          <div className="stat-info"><h3>{projectStats.inProgress}</h3><p>In Progress</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info"><h3>{projectStats.completed}</h3><p>Completed</p></div>
        </div>
      </div>

      {/* Project Status Chart */}
      <div className="chart-section">
        <div className="chart-card">
          <h3>Project Status Overview</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {[
                { label: "In Progress", value: projectStats.inProgress, color: "#ffeb3b" },
                { label: "Pending", value: projectStats.pending, color: "#ff9800" },
                { label: "Completed", value: projectStats.completed, color: "#4caf50" },
              ].map((item, index) => (
                <div key={index} className="chart-bar">
                  <div className="bar-label">{item.label}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ width: `${projectStats.total ? (item.value / projectStats.total) * 100 : 0}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                  <div className="bar-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="recent-projects">
        <h3>Recent Projects</h3>
        <div className="projects-grid">
          {projects.slice(0, 6).map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h4>{project.title}</h4>
                <span className={`status-badge ${project.status}`}>{project.status}</span>
              </div>
              <p className="project-description">{project.description || "No description provided"}</p>
              <div className="project-footer">
                <span className="creator">By: {project.creator?.name || "Unknown"}</span>
                <span className="assigned">Assigned to: {project.users && project.users.length > 0 ? project.users[0].name : "Unassigned"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCreateUser = () => (
    <div className="admin-section">
      <h2>Create New User</h2>
      <form onSubmit={handleCreateUser} className="admin-form">
        <div className="form-group">
          <label>Name</label>
          <input 
            type="text" 
            placeholder="Enter user name" 
            value={newUser.name} 
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} 
            className={userErrors.name ? 'error' : ''}
          />
          {userErrors.name && <span className="error-text">{userErrors.name}</span>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            placeholder="Enter user email" 
            value={newUser.email} 
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} 
            className={userErrors.email ? 'error' : ''}
          />
          {userErrors.email && <span className="error-text">{userErrors.email}</span>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Enter password" 
            value={newUser.password} 
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} 
            className={userErrors.password ? 'error' : ''}
          />
          {userErrors.password && <span className="error-text">{userErrors.password}</span>}
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input 
            type="password" 
            placeholder="Confirm password" 
            value={newUser.password_confirmation} 
            onChange={(e) => setNewUser({ ...newUser, password_confirmation: e.target.value })} 
            className={userErrors.password_confirmation ? 'error' : ''}
          />
          {userErrors.password_confirmation && <span className="error-text">{userErrors.password_confirmation}</span>}
        </div>
        <button type="submit" className="create-admin-btn">Create User</button>
      </form>
      {userMessage && (
        <div className={`message ${userMessage.includes('❌') ? 'error' : 'success'}`}>
          {userMessage}
        </div>
      )}
    </div>
  );

  const renderCreateProject = () => (
    <div className="admin-section">
      <h2>Create New Project</h2>
      <form onSubmit={handleCreateProject} className="admin-form">
        <div className="form-group">
          <label>Project Title</label>
          <input 
            type="text" 
            placeholder="Enter project title" 
            value={projectData.title} 
            onChange={(e) => setProjectData({ ...projectData, title: e.target.value })} 
            className={projectErrors.title ? 'error' : ''}
          />
          {projectErrors.title && <span className="error-text">{projectErrors.title}</span>}
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea 
            placeholder="Enter project description" 
            value={projectData.description} 
            onChange={(e) => setProjectData({ ...projectData, description: e.target.value })} 
            rows="4"
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select 
            value={projectData.status} 
            onChange={(e) => setProjectData({ ...projectData, status: e.target.value })}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="form-group">
          <label>Assign To</label>
          <select 
            value={projectData.assigned_to} 
            onChange={(e) => setProjectData({ ...projectData, assigned_to: e.target.value })}
            className={projectErrors.assigned_to ? 'error' : ''}
          >
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {projectErrors.assigned_to && <span className="error-text">{projectErrors.assigned_to}</span>}
        </div>
        <button type="submit" className="create-admin-btn">Create Project</button>
      </form>
      {projectMessage && (
        <div className={`message ${projectMessage.includes('❌') ? 'error' : 'success'}`}>
          {projectMessage}
        </div>
      )}
    </div>
  );

  const renderAllUsers = () => (
    <div className="admins-section">
      <h2>All Users ({users.length})</h2>
      <div className="admins-grid">
        {users.map((user) => (
          <div key={user.id} className="admin-card">
            {editingUserId === user.id ? (
              <div className="admin-edit-form">
                <input 
                  value={editingUserData.name} 
                  onChange={(e) => setEditingUserData({ ...editingUserData, name: e.target.value })} 
                  className="edit-input" 
                />
                <input 
                  value={editingUserData.email} 
                  onChange={(e) => setEditingUserData({ ...editingUserData, email: e.target.value })} 
                  className="edit-input" 
                />
                <div className="edit-actions">
                  <button onClick={() => handleUpdateUser(user.id)} className="save-btn">Save</button>
                  <button onClick={() => setEditingUserId(null)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="admin-info">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                </div>
                <div className="admin-actions">
                  <button 
                    onClick={() => {
                      setEditingUserId(user.id);
                      setEditingUserData({ name: user.name, email: user.email });
                    }} 
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllProjects = () => (
    <div className="projects-section">
      <h2>All Projects ({projects.length})</h2>
      <div className="projects-table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="project-title">
                  {editingProjectId === project.id ? (
                    <input 
                      value={editingProjectData.title} 
                      onChange={(e) => setEditingProjectData({ ...editingProjectData, title: e.target.value })} 
                      className="edit-input" 
                    />
                  ) : (
                    project.title
                  )}
                </td>
                <td className="project-description">
                  {editingProjectId === project.id ? (
                    <textarea 
                      value={editingProjectData.description} 
                      onChange={(e) => setEditingProjectData({ ...editingProjectData, description: e.target.value })} 
                      className="edit-input" 
                    />
                  ) : (
                    project.description || "-"
                  )}
                </td>
                <td>
                  {editingProjectId === project.id ? (
                    <select 
                      value={editingProjectData.status} 
                      onChange={(e) => setEditingProjectData({ ...editingProjectData, status: e.target.value })}
                      className="edit-input"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${project.status}`}>{project.status}</span>
                  )}
                </td>
                <td>{project.creator?.name || "Unknown"}</td>
                <td>
                  {project.users && project.users.length > 0
                    ? project.users.map((u) => u.name).join(", ")
                    : "Unassigned"}
                </td>
                <td>
                  {editingProjectId === project.id ? (
                    <div className="edit-actions">
                      <button onClick={() => handleUpdateProject(project.id)} className="save-btn">Save</button>
                      <button onClick={() => setEditingProjectId(null)} className="cancel-btn">Cancel</button>
                    </div>
                  ) : (
                    <div className="admin-actions">
                      <button 
                        onClick={() => {
                          setEditingProjectId(project.id);
                          setEditingProjectData({
                            title: project.title,
                            description: project.description,
                            status: project.status,
                          });
                        }} 
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)} className="delete-btn">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="loading-container">
      <div className="loader"></div>
      <p>Loading dashboard...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2>Error</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="retry-btn">Try Again</button>
    </div>
  );

  return (
    <div className="manager-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">SB</div>
            <span>SecureBoard</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <button className={`menu-item ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>
            <i className="fas fa-chart-bar"></i> Dashboard
          </button>
          <button className={`menu-item ${activeSection === 'create-user' ? 'active' : ''}`} onClick={() => setActiveSection('create-user')}>
            <i className="fas fa-user-plus"></i> Create User
          </button>
          <button className={`menu-item ${activeSection === 'create-project' ? 'active' : ''}`} onClick={() => setActiveSection('create-project')}>
            <i className="fas fa-plus-circle"></i> Create Project
          </button>
          <button className={`menu-item ${activeSection === 'all-users' ? 'active' : ''}`} onClick={() => setActiveSection('all-users')}>
            <i className="fas fa-users"></i> All Users
          </button>
          <button className={`menu-item ${activeSection === 'all-projects' ? 'active' : ''}`} onClick={() => setActiveSection('all-projects')}>
            <i className="fas fa-project-diagram"></i> All Projects
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{admin?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <strong>{admin?.name}</strong>
              <span>Admin</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1>
            {activeSection === 'dashboard' && 'Dashboard'}
            {activeSection === 'create-user' && 'Create User'}
            {activeSection === 'create-project' && 'Create Project'}
            {activeSection === 'all-users' && 'All Users'}
            {activeSection === 'all-projects' && 'All Projects'}
          </h1>
        </div>
        <div className="content-body">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'create-user' && renderCreateUser()}
          {activeSection === 'create-project' && renderCreateProject()}
          {activeSection === 'all-users' && renderAllUsers()}
          {activeSection === 'all-projects' && renderAllProjects()}
        </div>
      </div>
    </div>
  );
}