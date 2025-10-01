import React from "react";

const AdminDashboard = () => {
  const name = localStorage.getItem("name");

  return (
    <div>
      <h1>Hello Admin {name}</h1>
    </div>
  );
};

export default AdminDashboard;
