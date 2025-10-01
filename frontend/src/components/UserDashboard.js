import React from "react";

const UserDashboard = () => {
  const name = localStorage.getItem("name");

  return (
    <div>
      <h1>Hello User {name}</h1>
    </div>
  );
};

export default UserDashboard;
