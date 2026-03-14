import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../index/navbar";
import Footer from "../index/footer";
import { getProducts, normalizeCategory } from "../../admin/data/productStore";

const formatPrice = (value) => `INR ${Number(value || 0).toFixed(2)}`;

const getFinalPrice = (product) => {
  const price = Number(product.price) || 0;
  const discount = Math.min(100, Math.max(0, Number(product.discountPercentage) || 0));
  return Math.max(0, price - (price * discount) / 100);
};

const sortProducts = (items, sortBy) => {
  const arr = [...items];

  if (sortBy === "price_asc") {
    return arr.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
  }

  if (sortBy === "price_desc") {
    return arr.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
  }

  return arr.sort((a, b) => {
    const positionDiff = (Number(a.position) || 0) - (Number(b.position) || 0);
    if (positionDiff !== 0) return positionDiff;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
};

const CategoryProducts = () => {
  const { categoryKey = "" } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    (async () => {
      try {
        const items = await getProducts();
        setProducts(items);
      } catch (error) {
        setProducts([]);
      }
    })();
  }, []);

  const decodedKey = decodeURIComponent(categoryKey);

  const filtered = useMemo(() => {
    const categoryItems = products.filter(
      (product) =>
        (product.categoryKey || normalizeCategory(product.category)) === decodedKey
    );

    const bySearch = categoryItems.filter((product) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        String(product.name || "").toLowerCase().includes(q) ||
        String(product.description || "").toLowerCase().includes(q)
      );
    });

    return sortProducts(bySearch, sortBy);
  }, [decodedKey, products, search, sortBy]);

  const title = filtered[0]?.category || decodedKey || "Category";

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-gray-50">
      <div className="border-b border-rose-100 bg-white/95">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-sm font-semibold tracking-wide text-red-700">Category Listing</p>
          <h1 className="mt-2 text-5xl font-bold text-red-700">{title}</h1>
          <p className="mt-3 text-lg text-gray-600">
            {filtered.length} product{filtered.length === 1 ? "" : "s"} found
          </p>
          <Link
            to="/categories"
            className="mt-5 inline-block rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-600"
          >
            Back to categories
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            placeholder="Search product name or description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-600 shadow-sm">
            No products match your search in this category.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => {
              const image = Array.isArray(product.imageUrls) ? product.imageUrls[0] : "";
              const finalPrice = getFinalPrice(product);
              const hasDiscount = finalPrice < Number(product.price || 0);

              return (
                <article
                  key={product.id}
                  className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="flex h-48 items-center justify-center bg-gray-100 p-2">
                    {image ? (
                      <img src={image} alt={product.name} className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4">
                    <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
                    <p className="min-h-[40px] text-sm text-gray-600">
                      {product.description || "No description provided."}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-red-700">
                        {product.category}
                      </span>
                      <div className="text-right">
                        {hasDiscount ? (
                          <p className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</p>
                        ) : null}
                        <p className="text-lg font-bold text-gray-900">{formatPrice(finalPrice)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryProducts;
