import React from "react";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, to }) => {
  const content = (
    <div className="h-[168px] rounded-2xl bg-white p-6 shadow transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex h-full flex-col justify-between">
        <h3 className="min-h-[52px] text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-red-700">{value}</p>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }

  return (
    content
  );
};

export default StatCard;
