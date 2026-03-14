import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../index/navbar";
import Footer from "../index/footer";
import { getProducts } from "../../admin/data/productStore";
import { addToCart } from "../index/cartStore";
import { isLoggedIn } from "../index/authStore";

const formatPrice = (value) => `INR ${Number(value || 0).toFixed(2)}`;

const getFinalPrice = (product) => {
  const price = Number(product?.price) || 0;
  const discount = Math.min(100, Math.max(0, Number(product?.discountPercentage) || 0));
  return Math.max(0, price - (price * discount) / 100);
};

const ProductDetails = () => {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const items = await getProducts();
        setProducts(items);
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  const product = useMemo(
    () => products.find((item) => String(item.id) === String(productId)),
    [productId, products]
  );

  const images = Array.isArray(product?.imageUrls) ? product.imageUrls : [];
  const finalPrice = getFinalPrice(product);

  const onAddToCart = () => {
    if (!product) return;
    try {
      addToCart(product, 1);
      setMessage("Added to cart.");
    } catch (error) {
      setMessage(error?.message || "Could not add to cart.");
    }
  };

  const onBuyNow = () => {
    if (!product) return;
    try {
      addToCart(product, 1);
      if (isLoggedIn()) {
        navigate("/checkout");
        return;
      }
      navigate("/login", { state: { from: "/checkout" } });
    } catch (error) {
      setMessage(error?.message || "Could not proceed to buy.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-gray-50">
      <div className="border-b border-rose-100 bg-white/95">
        <Navbar />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {!product ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-600 shadow-sm">
            Product not found.{" "}
            <Link className="text-red-700 hover:underline" to="/categories">
              Back to categories
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {images[0] ? (
                  <img src={images[0]} alt={product.name} className="h-[420px] w-full object-cover" />
                ) : (
                  <div className="flex h-[420px] items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
              {images.length > 1 ? (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((src, index) => (
                    <img
                      key={`${src}-${index}`}
                      src={src}
                      alt={`${product.name}-${index + 2}`}
                      className="h-20 w-full rounded-lg border border-gray-200 object-cover"
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-red-700">{product.category}</p>
              <h1 className="mt-2 text-4xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-4 text-gray-600">{product.description || "No description provided."}</p>

              <div className="mt-6 space-y-1">
                {finalPrice < Number(product.price || 0) ? (
                  <p className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</p>
                ) : null}
                <p className="text-3xl font-bold text-red-700">{formatPrice(finalPrice)}</p>
                <p className="text-sm text-gray-600">Available: {Number(product.quantity || 0)}</p>
              </div>

              <div className="mt-8">
                <div className="mb-4 flex flex-wrap gap-3">
                  <button
                    className="rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white hover:bg-red-600"
                    onClick={onAddToCart}
                    type="button"
                  >
                    Add to Cart
                  </button>
                  <button
                    className="rounded-xl bg-gray-900 px-5 py-2.5 font-semibold text-white hover:bg-black"
                    onClick={onBuyNow}
                    type="button"
                  >
                    Buy Now
                  </button>
                </div>
                {message ? (
                  <p className={`mb-3 text-sm ${message.startsWith("Added") ? "text-green-700" : "text-red-600"}`}>
                    {message}
                  </p>
                ) : null}
                <Link
                  className="inline-block rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white hover:bg-red-600"
                  to={`/categories/${encodeURIComponent(product.categoryKey || product.category?.toLowerCase() || "")}`}
                >
                  Back to category
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
