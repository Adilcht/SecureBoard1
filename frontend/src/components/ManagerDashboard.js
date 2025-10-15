import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import "./ManagerDashboard.css";

export default function ManagerDashboard() {
  const [manager, setManager] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

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

        const [managerRes, adminsRes, projectsRes] = await Promise.all([
          axios.get(`${API_URL}/manager-connected`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/all-admins`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/projects-with-users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setManager(managerRes.data);
        setAdmins(adminsRes.data);
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

  // Logout
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    try {
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Logout failed ❌");
    }
  };

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    pending: projects.filter(p => p.status === 'pending').length,
    completed: projects.filter(p => p.status === 'completed').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
  };

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

  // Render sections
  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome back, {manager?.name}!</h1>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><i className="fas fa-folder"></i></div>
          <div className="stat-info"><h3>{projectStats.total}</h3><p>Total Projects</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress"><i className="fas fa-sync-alt"></i></div>
          <div className="stat-info"><h3>{projectStats.inProgress}</h3><p>In Progress</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><i className="fas fa-clock"></i></div>
          <div className="stat-info"><h3>{projectStats.pending}</h3><p>Pending</p></div>
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
                { label: "Cancelled", value: projectStats.cancelled, color: "#f44336" },
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
              <div className="project-footer"><span className="creator">By: {project.creator?.name || "Unknown"}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCreateAdmin = () => (
    <div className="admin-section">
      <h2>Create New Admin</h2>
      <form onSubmit={handleCreateAdmin} className="admin-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Enter admin name" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} className={adminErrors.name ? 'error' : ''} />
          {adminErrors.name && <span className="error-text">{adminErrors.name}</span>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Enter admin email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} className={adminErrors.email ? 'error' : ''} />
          {adminErrors.email && <span className="error-text">{adminErrors.email}</span>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} className={adminErrors.password ? 'error' : ''} />
          {adminErrors.password && <span className="error-text">{adminErrors.password}</span>}
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm password" value={newAdmin.password_confirmation} onChange={(e) => setNewAdmin({ ...newAdmin, password_confirmation: e.target.value })} className={adminErrors.password_confirmation ? 'error' : ''} />
          {adminErrors.password_confirmation && <span className="error-text">{adminErrors.password_confirmation}</span>}
        </div>
        <button type="submit" className="create-admin-btn">Create Admin</button>
      </form>
    </div>
  );

  const renderAllAdmins = () => (
    <div className="admins-section">
      <h2>All Admins ({admins.length})</h2>
      <div className="admins-grid">
        {admins.map((admin) => (
          <div key={admin.id} className="admin-card">
            {editingAdmin === admin.id ? (
              <div className="admin-edit-form">
                <input value={admin.name} onChange={(e) => setAdmins(admins.map((x) => (x.id === admin.id ? { ...x, name: e.target.value } : x)))} className="edit-input" />
                <input value={admin.email} onChange={(e) => setAdmins(admins.map((x) => (x.id === admin.id ? { ...x, email: e.target.value } : x)))} className="edit-input" />
                <div className="edit-actions">
                  <button onClick={() => handleUpdateAdmin(admin.id, admin)} className="save-btn">Save</button>
                  <button onClick={() => setEditingAdmin(null)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="admin-info"><h4>{admin.name}</h4><p>{admin.email}</p></div>
                <div className="admin-actions">
                  <button onClick={() => setEditingAdmin(admin.id)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDeleteAdmin(admin.id)} className="delete-btn">Delete</button>
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
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="project-title">{project.title}</td>
                <td className="project-description">{project.description || "-"}</td>
                <td><span className={`status-badge ${project.status}`}>{project.status}</span></td>
                <td>{project.creator?.name || "Unknown"}</td>
                <td>{project.users && project.users.length > 0 ? project.users.map((u) => u.name).join(", ") : "Unassigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="loading-container"><div className="loader"></div><p>Loading dashboard...</p></div>
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
          <div className="logo"><div className="logo-icon">SB</div><span>SecureBoard</span></div>
        </div>

        <div className="sidebar-menu">
          <button className={`menu-item ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}><i className="fas fa-chart-bar"></i> Dashboard</button>
          <button className={`menu-item ${activeSection === 'create-admin' ? 'active' : ''}`} onClick={() => setActiveSection('create-admin')}><i className="fas fa-user-plus"></i> Create New Admin</button>
          <button className={`menu-item ${activeSection === 'all-admins' ? 'active' : ''}`} onClick={() => setActiveSection('all-admins')}><i className="fas fa-users"></i> All Admins</button>
          <button className={`menu-item ${activeSection === 'all-projects' ? 'active' : ''}`} onClick={() => setActiveSection('all-projects')}><i className="fas fa-project-diagram"></i> All Projects</button>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{manager?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details"><strong>{manager?.name}</strong><span>Manager</span></div>
          </div>

          {/* Logout Button */}
          <button onClick={handleLogout} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1>
            {activeSection === 'dashboard' && 'Dashboard'}
            {activeSection === 'create-admin' && 'Create New Admin'}
            {activeSection === 'all-admins' && 'All Admins'}
            {activeSection === 'all-projects' && 'All Projects'}
          </h1>
        </div>
        <div className="content-body">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'create-admin' && renderCreateAdmin()}
          {activeSection === 'all-admins' && renderAllAdmins()}
          {activeSection === 'all-projects' && renderAllProjects()}
        </div>
      </div>
    </div>
  );
}
