import React from "react";

const Topbar = () => {
  return (
    <div className="bg-white shadow p-4 flex justify-between">
      <h2 className="text-xl font-bold text-red-700">Admin Dashboard</h2>
      <button className="bg-red-700 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
};

export default Topbar;