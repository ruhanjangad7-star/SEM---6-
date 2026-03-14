import React from "react";
import { Link } from "react-router-dom";
import Footer from "../index/footer";
import "remixicon/fonts/remixicon.css";
import Navbar from "../index/navbar";

const Main = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="border-b border-rose-100 bg-white/95">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-red-700">Why Choose NEXAIRE LAPTOPS?</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">
              We make laptop selection easier by organizing products around real user needs, not just specs or price.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-6xl space-y-12 px-4 pb-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Our Mission</h2>
          <p className="mt-3 leading-8 text-gray-600">
            NEXAIRE LAPTOPS is a category-based e-commerce platform designed to help students and professionals
            choose laptops by usage scenarios like coding, gaming, and battery backup. Built with Flask and SQLite,
            the system focuses on clear browsing, practical comparisons, and confident buying decisions.
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">What Makes Us Different</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl text-red-700">
                <i className="ri-battery-2-charge-line"></i>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Usage-Based Picks</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Recommendations built around real workflows like development, classes, office tasks, and gaming.
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl text-red-700">
                <i className="ri-layout-grid-line"></i>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Clear Categories</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Coding, gaming, battery backup, thin and light, and more, so browsing feels fast and simple.
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl text-red-700">
                <i className="ri-code-s-slash-line"></i>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Built For Power Users</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                We keep performance, multitasking, and long-session comfort at the center of every recommendation.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">How NEXAIRE LAPTOPS Works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["1", "Choose Category", "Select what matches your work or study style."],
              ["2", "Explore Products", "Browse curated laptops with practical details."],
              ["3", "Compare Value", "Review price, discount, and expected usage fit."],
              ["4", "Order Confidently", "Checkout with clear information and status tracking."],
            ].map(([step, title, text]) => (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" key={step}>
                <p className="text-sm font-bold uppercase tracking-wider text-red-700">Step {step}</p>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-3">
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-3xl font-bold text-red-700">100%</p>
            <p className="mt-1 text-sm text-gray-700">Focused on practical buying decisions</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-3xl font-bold text-red-700">Fast</p>
            <p className="mt-1 text-sm text-gray-700">Simple categories reduce search time</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-3xl font-bold text-red-700">Reliable</p>
            <p className="mt-1 text-sm text-gray-700">Transparent flow from browsing to checkout</p>
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-red-700 to-red-500 px-6 py-10 text-center text-white shadow-lg">
          <h2 className="text-3xl font-bold">Find Your Perfect Laptop Today</h2>
          <p className="mx-auto mt-3 max-w-2xl text-red-100">
            Browse categories and discover laptops matched to your real needs.
          </p>
          <Link
            className="mt-6 inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            to="/categories"
          >
            Browse Categories
          </Link>
        </section>
      </section>

      <Footer />
    </div>
  );
};

export default Main;
