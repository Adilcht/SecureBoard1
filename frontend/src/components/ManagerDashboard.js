import React from "react";

const ManagerDashboard = () => {
  const name = localStorage.getItem("name");

  return (
    <div>
      <h1>Hello Manager {name}</h1>
    </div>
  );
};

export default ManagerDashboard;
