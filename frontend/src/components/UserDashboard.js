import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  // Création de projet
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [projectMessage, setProjectMessage] = useState("");

  // Mes projets
  const [myProjects, setMyProjects] = useState([]);

  // Projets assignés
  const [assignedProjects, setAssignedProjects] = useState([]);

  // Projet en édition
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("pending");

  const token = localStorage.getItem("token");

  // ------------------- Fetch utilisateur connecté -------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/user-connected`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors du fetch utilisateur");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // ------------------- Fetch users rôle "user" -------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [token]);

  // ------------------- Fetch mes projets -------------------
  const fetchMyProjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/my-projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------- Fetch projets assignés -------------------
  const fetchAssignedProjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/assigned-projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyProjects();
      fetchAssignedProjects();
    }
  }, [user]);

  // Calculate project statistics - TOUTES LES STATISTIQUES
  const projectStats = {
    // Mes projets
    myProjects: myProjects.length,
    myPending: myProjects.filter(p => p.status === 'pending').length,
    myInProgress: myProjects.filter(p => p.status === 'in_progress').length,
    myCompleted: myProjects.filter(p => p.status === 'completed').length,
    
    // Projets assignés
    assignedProjects: assignedProjects.length,
    assignedPending: assignedProjects.filter(p => p.status === 'pending').length,
    assignedInProgress: assignedProjects.filter(p => p.status === 'in_progress').length,
    assignedCompleted: assignedProjects.filter(p => p.status === 'completed').length,
    
    // Totaux
    totalProjects: myProjects.length + assignedProjects.length,
    totalPending: myProjects.filter(p => p.status === 'pending').length + assignedProjects.filter(p => p.status === 'pending').length,
    totalInProgress: myProjects.filter(p => p.status === 'in_progress').length + assignedProjects.filter(p => p.status === 'in_progress').length,
    totalCompleted: myProjects.filter(p => p.status === 'completed').length + assignedProjects.filter(p => p.status === 'completed').length,
  };

  // ------------------- Logout -------------------
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    } catch (err) {
      console.error("Erreur logout:", err.response?.data || err);
      alert("Erreur lors de la déconnexion");
    }
  };

  // ------------------- Créer projet -------------------
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/user-projects`,
        { title, description, status, assigned_users: assignedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjectMessage("✅ Project created successfully!");
      setTitle(""); 
      setDescription(""); 
      setStatus("pending"); 
      setAssignedUsers([]);
      fetchMyProjects();
    } catch (err) {
      setProjectMessage("❌ Error creating project");
    }
  };

  // ------------------- Mise à jour projet -------------------
  const handleSaveEdit = async (projectId) => {
    try {
      await axios.put(
        `${API_URL}/user-projects/${projectId}`,
        { title: editTitle, description: editDescription, status: editStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingProjectId(null);
      fetchMyProjects();
    } catch (err) {
      console.error(err);
      alert("Error updating project");
    }
  };

  // ------------------- Supprimer projet -------------------
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await axios.delete(`${API_URL}/user-projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // Render sections
  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's an overview of your projects.</p>
      </div>

      {/* Statistics Cards - TOUTES LES STATISTIQUES */}
      <div className="stats-grid">
        {/* Mes projets */}
        <div className="stat-card">
          <div className="stat-icon total"><i className="fas fa-folder"></i></div>
          <div className="stat-info">
            <h3>{projectStats.myProjects}</h3>
            <p>My Projects</p>
            <div className="stat-details">
              <span className="pending">P: {projectStats.myPending}</span>
              <span className="in-progress">IP: {projectStats.myInProgress}</span>
              <span className="completed">C: {projectStats.myCompleted}</span>
            </div>
          </div>
        </div>

        {/* Projets assignés */}
        <div className="stat-card">
          <div className="stat-icon assigned"><i className="fas fa-users"></i></div>
          <div className="stat-info">
            <h3>{projectStats.assignedProjects}</h3>
            <p>Assigned Projects</p>
            <div className="stat-details">
              <span className="pending">P: {projectStats.assignedPending}</span>
              <span className="in-progress">IP: {projectStats.assignedInProgress}</span>
              <span className="completed">C: {projectStats.assignedCompleted}</span>
            </div>
          </div>
        </div>

        {/* Total Projects */}
        <div className="stat-card">
          <div className="stat-icon total-all"><i className="fas fa-chart-bar"></i></div>
          <div className="stat-info">
            <h3>{projectStats.totalProjects}</h3>
            <p>Total Projects</p>
            <div className="stat-details">
              <span className="pending">P: {projectStats.totalPending}</span>
              <span className="in-progress">IP: {projectStats.totalInProgress}</span>
              <span className="completed">C: {projectStats.totalCompleted}</span>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="stat-card">
          <div className="stat-icon overview"><i className="fas fa-tasks"></i></div>
          <div className="stat-info">
            <h3>Status</h3>
            <p>Overview</p>
            <div className="stat-details">
              <span className="pending">Pending: {projectStats.totalPending}</span>
              <span className="in-progress">In Progress: {projectStats.totalInProgress}</span>
              <span className="completed">Completed: {projectStats.totalCompleted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Status Chart */}
      <div className="chart-section">
        <div className="chart-card">
          <h3>Project Status Distribution</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {[
                { label: "Pending", value: projectStats.totalPending, color: "#ff9800" },
                { label: "In Progress", value: projectStats.totalInProgress, color: "#ffeb3b" },
                { label: "Completed", value: projectStats.totalCompleted, color: "#4caf50" },
              ].map((item, index) => (
                <div key={index} className="chart-bar">
                  <div className="bar-label">{item.label}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${projectStats.totalProjects ? 
                          (item.value / projectStats.totalProjects) * 100 : 0}%`, 
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                  <div className="bar-value">{item.value} ({projectStats.totalProjects ? Math.round((item.value / projectStats.totalProjects) * 100) : 0}%)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent My Projects */}
      <div className="recent-projects">
        <div className="section-header">
          <h3>My Recent Projects</h3>
          <span className="section-count">{projectStats.myProjects} total</span>
        </div>
        <div className="projects-grid">
          {myProjects.slice(0, 6).map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h4>{project.title}</h4>
                <span className={`status-badge ${project.status}`}>{project.status}</span>
              </div>
              <p className="project-description">{project.description || "No description provided"}</p>
              <div className="project-footer">
                <span className="assigned">Assigned to: {project.users.length} user(s)</span>
                <span className="date">Created: {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
        {myProjects.length === 0 && (
          <div className="no-data">
            <i className="fas fa-folder-open"></i>
            <p>No projects created yet</p>
          </div>
        )}
      </div>

      {/* Recent Assigned Projects */}
      <div className="recent-projects">
        <div className="section-header">
          <h3>Recent Assigned Projects</h3>
          <span className="section-count">{projectStats.assignedProjects} total</span>
        </div>
        <div className="projects-grid">
          {assignedProjects.slice(0, 6).map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h4>{project.title}</h4>
                <span className={`status-badge ${project.status}`}>{project.status}</span>
              </div>
              <p className="project-description">{project.description || "No description provided"}</p>
              <div className="project-footer">
                <span className="creator">By: {project.creator?.name || "Unknown"}</span>
                <span className="date">Created: {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
        {assignedProjects.length === 0 && (
          <div className="no-data">
            <i className="fas fa-users"></i>
            <p>No projects assigned to you</p>
          </div>
        )}
      </div>
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
            value={title} 
            onChange={(e)=>setTitle(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea 
            placeholder="Enter project description" 
            value={description} 
            onChange={(e)=>setDescription(e.target.value)} 
            rows="4"
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="form-group">
          <label>Assign Users</label>
          <div className="users-checkbox-list">
            {allUsers.map(u => (
              <label key={u.id} className="checkbox-item">
                <input 
                  type="checkbox" 
                  value={u.id} 
                  checked={assignedUsers.includes(u.id)} 
                  onChange={(e)=>{
                    const id = parseInt(e.target.value);
                    if(e.target.checked) setAssignedUsers([...assignedUsers, id]);
                    else setAssignedUsers(assignedUsers.filter(uid => uid !== id));
                  }} 
                />
                <span>{u.id === user?.id ? `${u.name} (you)` : `${u.name} (${u.email})`}</span>
              </label>
            ))}
          </div>
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

  const renderMyProjects = () => (
    <div className="projects-section">
      <h2>My Projects ({myProjects.length})</h2>
      {myProjects.length === 0 ? (
        <div className="no-data">
          <i className="fas fa-folder-open"></i>
          <p>No projects created yet</p>
        </div>
      ) : (
        <div className="projects-table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Assigned Users</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myProjects.map(project => (
                <tr key={project.id}>
                  <td className="project-title">
                    {editingProjectId === project.id ? (
                      <input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      project.title
                    )}
                  </td>
                  <td className="project-description">
                    {editingProjectId === project.id ? (
                      <input
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      project.description || "-"
                    )}
                  </td>
                  <td>
                    {editingProjectId === project.id ? (
                      <select 
                        value={editStatus} 
                        onChange={e => setEditStatus(e.target.value)} 
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
                  <td>
                    {project.users.map(u => u.id === user?.id ? `${u.name} (you)` : u.name).join(", ")}
                  </td>
                  <td>
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {editingProjectId === project.id ? (
                      <div className="edit-actions">
                        <button onClick={() => handleSaveEdit(project.id)} className="save-btn">Save</button>
                        <button onClick={() => setEditingProjectId(null)} className="cancel-btn">Cancel</button>
                      </div>
                    ) : (
                      <div className="admin-actions">
                        <button
                          onClick={() => {
                            setEditingProjectId(project.id);
                            setEditTitle(project.title);
                            setEditDescription(project.description);
                            setEditStatus(project.status);
                          }}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAssignedProjects = () => (
    <div className="projects-section">
      <h2>Assigned Projects ({assignedProjects.length})</h2>
      {assignedProjects.length === 0 ? (
        <div className="no-data">
          <i className="fas fa-users"></i>
          <p>No projects assigned to you</p>
        </div>
      ) : (
        <div className="projects-table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Assigned Users</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {assignedProjects.map(project => (
                <tr key={project.id}>
                  <td className="project-title">{project.title}</td>
                  <td className="project-description">{project.description || "-"}</td>
                  <td>
                    <span className={`status-badge ${project.status}`}>{project.status}</span>
                  </td>
                  <td>{project.creator?.name || "—"}</td>
                  <td>
                    {project.users.map(u => u.id === user?.id ? `${u.name} (you)` : u.name).join(", ")}
                  </td>
                  <td>
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
          <button className={`menu-item ${activeSection === 'create-project' ? 'active' : ''}`} onClick={() => setActiveSection('create-project')}>
            <i className="fas fa-plus-circle"></i> Create Project
          </button>
          <button className={`menu-item ${activeSection === 'my-projects' ? 'active' : ''}`} onClick={() => setActiveSection('my-projects')}>
            <i className="fas fa-folder"></i> My Projects
          </button>
          <button className={`menu-item ${activeSection === 'assigned-projects' ? 'active' : ''}`} onClick={() => setActiveSection('assigned-projects')}>
            <i className="fas fa-users"></i> Assigned Projects
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <strong>{user?.name}</strong>
              <span>User</span>
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
            {activeSection === 'create-project' && 'Create Project'}
            {activeSection === 'my-projects' && 'My Projects'}
            {activeSection === 'assigned-projects' && 'Assigned Projects'}
          </h1>
        </div>
        <div className="content-body">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'create-project' && renderCreateProject()}
          {activeSection === 'my-projects' && renderMyProjects()}
          {activeSection === 'assigned-projects' && renderAssignedProjects()}
        </div>
      </div>
    </div>
  );
}