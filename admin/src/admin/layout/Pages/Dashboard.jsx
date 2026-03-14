import React from "react";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <StatCard title="Total Products" value="120" />
      <StatCard title="Users" value="350" />
      <StatCard title="Categories" value="8" />
    </div>
  );
};

export default Dashboard;