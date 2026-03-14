import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, normalizeCategory } from "../data/productStore";

const Categories = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const items = await getProducts({ includeOutOfStock: true });
        setProducts(items);
      } catch (error) {
        setProducts([]);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      const key = product.categoryKey || normalizeCategory(product.category);
      const label = (product.category || "Uncategorized").trim() || "Uncategorized";

      if (!map.has(key)) {
        map.set(key, { key, label, count: 0, latest: product.createdAt || "" });
      }

      const current = map.get(key);
      current.count += 1;

      if ((product.createdAt || "") > (current.latest || "")) {
        current.latest = product.createdAt || "";
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <p className="mt-2 text-sm text-red-100">Categories are generated automatically from added products.</p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-gray-600 shadow">No categories yet. Add a product first.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.key}
              to={`/admin/categories/${encodeURIComponent(category.key)}`}
              className="rounded-lg bg-white p-5 shadow transition hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-900">{category.label}</h2>
              <p className="mt-2 text-sm text-gray-600">
                {category.count} product{category.count === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;

