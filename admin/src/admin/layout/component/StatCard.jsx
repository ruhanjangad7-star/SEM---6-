import React from "react";

const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-3xl font-bold text-red-700">{value}</p>
    </div>
  );
};

export default StatCard;