import React from "react";
import { useNavigate } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import Navbar from "../index/navbar";
import Footer from "../index/footer";
import { normalizeCategory } from "../../admin/data/productStore";

import batteryImg from "./img/Mac.png";
import thinLightImg from "./img/Thin.png";
import macbookImg from "./img/Battery.png";
import gamingImg from "./img/Gaming.png";
import proImg from "./img/Pro.png";
import studentImg from "./img/Student.png";
import codingImg from "./img/Coding.png";
const Main = () => {

  const navigate = useNavigate();

  const data = [
    { img: codingImg, title: "Coding", subtitle: "Dev tools, CPUs, RAM focus" },
    { img: macbookImg, title: "Macbook", subtitle: "macOS ecosystem and premium build" },
    { img: batteryImg, title: "Battery Backup", subtitle: "Long life for travel and work" },
    { img: gamingImg, title: "Gaming", subtitle: "High FPS with strong GPU options" },
    { img: studentImg, title: "Student", subtitle: "Affordable picks for classes" },
    { img: thinLightImg, title: "Thin & Light", subtitle: "Portable daily carry laptops" },
    { img: proImg, title: "Professional", subtitle: "Performance for business workflows" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="border-b border-rose-100 bg-white/95">
        <Navbar />

        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-5xl font-extrabold text-red-700 tracking-tight">Laptop Categories</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">
            Browse laptops by real needs like coding, gaming, portability, and battery life.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 pt-10 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <article
            key={item.title}
            className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={item.img}
                alt={item.title}
                className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white">{item.title}</h2>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm text-gray-600">{item.subtitle}</p>
              <button
                onClick={() =>
                  navigate(`/categories/${encodeURIComponent(normalizeCategory(item.title))}`)
                }
                className="w-full rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white transition hover:bg-red-600"
              >
                Explore Products
              </button>
            </div>
          </article>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Main;

