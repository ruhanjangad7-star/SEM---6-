import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./footer";
import {
  clearCart,
  getCartItems,
  removeFromCart,
  syncCartWithDatabaseProducts,
  updateCartItemQuantity,
} from "./cartStore";

const formatPrice = (value) => `INR ${Number(value || 0).toFixed(2)}`;

const getFinalPrice = (item) => {
  const price = Number(item?.price) || 0;
  const discount = Math.min(100, Math.max(0, Number(item?.discountPercentage) || 0));
  return Math.max(0, price - (price * discount) / 100);
};

const CartPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const synced = await syncCartWithDatabaseProducts();
      setItems(synced);
    })();
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + getFinalPrice(item) * Number(item.quantity || 1), 0),
    [items]
  );

  const onChangeQuantity = (id, quantity) => {
    try {
      const current = items.find((item) => String(item.id) === String(id));
      const maxAvailable = Number(current?.availableQuantity || 0);
      const next = updateCartItemQuantity(id, quantity, maxAvailable);
      setItems(next);
      setError("");
    } catch (err) {
      setError(err?.message || "Quantity exceeds available stock.");
    }
  };

  const onRemove = (id) => {
    const next = removeFromCart(id);
    setItems(next);
  };

  const onClear = () => {
    setItems(clearCart());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-gray-50">
      <div className="border-b border-rose-100 bg-white/95">
        <Navbar />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-700 to-red-500 px-6 py-7 text-white shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-100">Shopping Cart</p>
          <h1 className="mt-2 text-4xl font-bold">Your Cart</h1>
          <p className="mt-2 text-sm text-red-100">
            Review your selected laptops and proceed to secure checkout.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            {items.length} item{items.length === 1 ? "" : "s"} in your cart
          </p>
          {items.length > 0 ? (
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              onClick={onClear}
              type="button"
            >
              Clear Cart
            </button>
          ) : null}
        </div>
        {error ? <p className="mb-4 text-sm font-medium text-red-600">{error}</p> : null}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
            <p className="text-lg font-semibold text-gray-900">Your cart is empty</p>
            <p className="mt-2 text-sm text-gray-600">Looks like you have not added any products yet.</p>
            <Link
              className="mt-5 inline-block rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              to="/categories"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {items.map((item) => {
                const unitPrice = getFinalPrice(item);
                const available = Math.max(0, Number(item.availableQuantity || 0));
                return (
                  <article
                    key={item.id}
                    className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr]"
                  >
                    <div className="h-28 w-full overflow-hidden rounded-xl bg-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-500">No Image</div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                        <p className="text-lg font-bold text-red-700">{formatPrice(unitPrice)}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm font-medium text-gray-700" htmlFor={`qty-${item.id}`}>
                          Qty
                        </label>
                        <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300">
                          <button
                            className="px-3 py-1.5 text-lg text-gray-700 hover:bg-gray-100"
                            onClick={() => onChangeQuantity(item.id, Number(item.quantity) - 1)}
                            type="button"
                          >
                            -
                          </button>
                          <input
                            className="w-16 border-x border-gray-300 px-2 py-1.5 text-center text-sm outline-none"
                            id={`qty-${item.id}`}
                            min="1"
                            max={Math.max(1, available)}
                            type="number"
                            value={item.quantity}
                            onChange={(event) => onChangeQuantity(item.id, event.target.value)}
                          />
                          <button
                            className="px-3 py-1.5 text-lg text-gray-700 hover:bg-gray-100"
                            onClick={() => onChangeQuantity(item.id, Number(item.quantity) + 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          stock: {available}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          total: {formatPrice(unitPrice * Number(item.quantity || 1))}
                        </span>
                        <button
                          className="ml-auto text-sm font-semibold text-red-600 hover:text-red-700"
                          onClick={() => onRemove(item.id)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold">{formatPrice(items.length > 0 ? 99 : 0)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(subtotal + (items.length > 0 ? 99 : 0))}</span>
                </div>
              </div>

              <button
                className="mt-6 w-full rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-600"
                onClick={() => navigate("/checkout")}
                type="button"
              >
                Checkout
              </button>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
