import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProducts, normalizeCategory } from "../data/productStore";

const CategoryDetails = () => {
  const { categoryName = "" } = useParams();
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

  const key = decodeURIComponent(categoryName);

  const filtered = useMemo(
    () => products.filter((product) => (product.categoryKey || normalizeCategory(product.category)) === key),
    [key, products]
  );

  const categoryLabel = filtered[0]?.category || key || "Category";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">{categoryLabel}</h1>
        <p className="mt-2 text-sm text-red-100">
          {filtered.length} product{filtered.length === 1 ? "" : "s"} in this category
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          className="rounded bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          to="/admin/categories"
        >
          Back to Categories
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full min-w-[520px]">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-gray-500" colSpan={3}>
                  No products found in this category.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr className="border-t" key={product.id}>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">INR {Number(product.price || 0).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryDetails;

