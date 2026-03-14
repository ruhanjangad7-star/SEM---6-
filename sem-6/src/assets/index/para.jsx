import React from "react";

const highlights = [
  {
    title: "Use-case Based Selection",
    description: "Pick laptops by what you do daily instead of guessing technical specs.",
  },
  {
    title: "Transparent Pricing",
    description: "See real discounts and final prices clearly before checkout.",
  },
  {
    title: "Reliable Buying Experience",
    description: "Smooth cart and checkout flow designed for speed and clarity.",
  },
];

const Para = () => {
  return (
    <section className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-xl sm:p-10 lg:p-12">
          <h2 className="text-3xl font-extrabold leading-tight text-red-700 sm:text-4xl">
            NEXAIRE LAPTOPS: Category-Based Buying Made Simple
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-relaxed text-gray-700 sm:text-lg">
            NEXAIRE LAPTOPS helps users find the right device through usage-based categories like Coding, Gaming,
            and Battery Backup. With complete specifications, transparent pricing, cart support, and simulated
            checkout, the platform delivers a clear and user-friendly shopping experience.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5">
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Para;
