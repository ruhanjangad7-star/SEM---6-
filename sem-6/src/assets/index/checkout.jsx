import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./footer";
import { clearCart, getCartItems, syncCartWithDatabaseProducts } from "./cartStore";
import { getCurrentUser } from "./authStore";
import { createOrder } from "./orderStore";

const formatPrice = (value) => `INR ${Number(value || 0).toFixed(2)}`;

const getFinalPrice = (item) => {
  const price = Number(item?.price) || 0;
  const discount = Math.min(100, Math.max(0, Number(item?.discountPercentage) || 0));
  return Math.max(0, price - (price * discount) / 100);
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCartItems());
  const user = getCurrentUser();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "cod",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
  const shipping = items.length > 0 ? 99 : 0;
  const total = subtotal + shipping;

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPlaceOrder = async (event) => {
    event.preventDefault();
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!form.fullName.trim() || !form.email.trim() || !form.address.trim() || !form.city.trim()) {
      setError("Please fill required checkout details.");
      return;
    }

    try {
      await createOrder({
        ...form,
        items,
        subtotal,
        shipping,
        total,
      });
      clearCart();
      setSuccess("Order placed successfully.");
      setError("");
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      setError(err?.message || "Failed to place order.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-gray-50">
      <div className="border-b border-rose-100 bg-white/95">
        <Navbar />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-6 text-4xl font-bold text-red-700">Checkout</h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-600 shadow-sm">
            Your cart is empty.{" "}
            <Link className="font-semibold text-red-700 hover:underline" to="/categories">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <form className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" onSubmit={onPlaceOrder}>
              <h2 className="text-2xl font-semibold text-gray-900">Shipping Details</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <input className="rounded-lg border px-3 py-2.5" name="fullName" placeholder="Full Name *" value={form.fullName} onChange={onChange} />
                <input className="rounded-lg border px-3 py-2.5" name="email" placeholder="Email *" type="email" value={form.email} onChange={onChange} />
                <input className="rounded-lg border px-3 py-2.5" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
                <input className="rounded-lg border px-3 py-2.5" name="zipCode" placeholder="ZIP Code" value={form.zipCode} onChange={onChange} />
              </div>

              <input className="w-full rounded-lg border px-3 py-2.5" name="address" placeholder="Address *" value={form.address} onChange={onChange} />
              <input className="w-full rounded-lg border px-3 py-2.5" name="city" placeholder="City *" value={form.city} onChange={onChange} />

              <select className="w-full rounded-lg border px-3 py-2.5" name="paymentMethod" value={form.paymentMethod} onChange={onChange}>
                <option value="cod">Cash on Delivery</option>
                <option value="card">Card Payment</option>
                <option value="upi">UPI</option>
              </select>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-green-700">{success}</p> : null}

              <button className="w-full rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-600" type="submit">
                Place Order
              </button>
            </form>

            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
              <div className="mt-4 space-y-3 text-sm">
                {items.map((item) => (
                  <div className="flex items-center justify-between" key={item.id}>
                    <span className="text-gray-700">{item.name} x {item.quantity}</span>
                    <span className="font-medium">{formatPrice(getFinalPrice(item) * Number(item.quantity || 1))}</span>
                  </div>
                ))}
                <hr />
                <div className="flex items-center justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <Link className="mt-5 inline-block text-sm font-semibold text-red-700 hover:underline" to="/cart">
                Back to cart
              </Link>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
