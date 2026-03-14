import React from "react";
import { Link } from "react-router-dom";

const Body = () => {
  return (
    <section className="relative flex min-h-[62vh] items-center px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
      <div className="absolute inset-0 m-2 rounded-2xl bg-black/45" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 text-white">
        <p className="w-fit rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
          Laptop E-commerce
        </p>

        <h1 className="max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-6xl">
          Find The Right Laptop For Coding, Gaming, Study, And Work
        </h1>

        <p className="max-w-2xl text-sm text-rose-100 sm:text-[15px]">
          Compare curated laptops by real use case, check honest pricing, and buy with a smooth checkout flow.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/categories"
            className="rounded-xl bg-red-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Explore Categories
          </Link>
          <Link
            to="/why-us"
            className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Why Choose Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Body;
