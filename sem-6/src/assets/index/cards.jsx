import React from "react";
import { useNavigate } from "react-router-dom";
import { normalizeCategory } from "../../admin/data/productStore";

import batteryImg from "./img/Mac.png";
import thinLightImg from "./img/Thin.png";
import macbookImg from "./img/Battery.png";
import gamingImg from "./img/Gaming.png";
import proImg from "./img/Pro.png";
import studentImg from "./img/Student.png";
import codingImg from "./img/Coding.png";

const Cards = () => {
  const navigate = useNavigate();

  const categories = [
    { img: codingImg, title: "Coding", subtitle: "Powerful CPU, RAM, and dev-friendly setup" },
    { img: macbookImg, title: "Macbook", subtitle: "Premium build and smooth macOS workflow" },
    { img: batteryImg, title: "Battery Backup", subtitle: "Work and travel all day without charging" },
    { img: gamingImg, title: "Gaming", subtitle: "High refresh displays and dedicated graphics" },
    { img: studentImg, title: "Student", subtitle: "Affordable everyday performance for classes" },
    { img: thinLightImg, title: "Thin & Light", subtitle: "Portable design for daily carry" },
    { img: proImg, title: "Professional", subtitle: "Reliable performance for business tasks" },
  ];

  return (
    <section className="bg-gradient-to-b from-white via-rose-50 to-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Shop By Need</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Home Categories</h2>
            <p className="mt-2 max-w-xl text-sm text-gray-600">
              Pick a category to quickly explore laptops that match your daily workflow.
            </p>
          </div>
          <button
            className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            onClick={() => navigate("/categories")}
            type="button"
          >
            View All Categories
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-52 overflow-hidden bg-gray-100">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <h3 className="absolute bottom-3 left-3 text-xl font-bold text-white">{item.title}</h3>
              </div>

              <div className="space-y-4 p-4">
                <p className="text-sm text-gray-600">{item.subtitle}</p>
                <button
                  className="w-full rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                  onClick={() =>
                    navigate(`/categories/${encodeURIComponent(normalizeCategory(item.title))}`)
                  }
                  type="button"
                >
                  Explore {item.title}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Cards;

