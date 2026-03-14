import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../index/footer";
import "remixicon/fonts/remixicon.css";
import Navbar from "../index/navbar";
import { createContactMessage } from "./contactStore";
import { getCurrentUser } from "../index/authStore";

const Main = () => {
  const navigate = useNavigate();
  const [sessionUser] = useState(() => getCurrentUser());
  const isLoggedIn = Boolean(sessionUser);
  const isProfileLocked = Boolean(
    isLoggedIn && String(sessionUser?.name || "").trim() && String(sessionUser?.email || "").trim()
  );
  const [form, setForm] = useState({
    name: sessionUser?.name || "",
    email: sessionUser?.email || "",
    phone: "",
    subject: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setSuccess("");
      setError("Please login first to send a message.");
      navigate("/login", { state: { from: "/contact-us" } });
      return;
    }

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setSuccess("");
      setError("Name, email, subject, and message are required.");
      return;
    }

    try {
      setSaving(true);
      await createContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setError("");
      setSuccess("Message sent successfully. We will contact you soon.");
    } catch (submitError) {
      setSuccess("");
      setError(submitError?.message || "Could not send message.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="border-b border-rose-100 bg-white/95">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-red-700">Contact Us</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">
              Have a question about laptops, orders, returns, or support? Our team is here to help.
          </p>
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-14 md:grid-cols-3">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-xl text-red-700">
            <i className="ri-mail-line"></i>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Email</h2>
          <p className="mt-2 text-sm text-gray-600">We usually reply within 24 hours.</p>
          <a className="mt-3 inline-block font-semibold text-red-700 hover:text-red-600" href="mailto:contact@laptopstore.com">
            contact@laptopstore.com
          </a>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-xl text-red-700">
            <i className="ri-phone-line"></i>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Phone</h2>
          <p className="mt-2 text-sm text-gray-600">Mon-Sat, 10:00 AM - 7:00 PM</p>
          <a className="mt-3 inline-block font-semibold text-red-700 hover:text-red-600" href="tel:+11234567890">
            +1 (123) 456-7890
          </a>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-xl text-red-700">
            <i className="ri-map-pin-line"></i>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Office</h2>
          <p className="mt-2 text-sm text-gray-600">123 Laptop Street, Tech City, Country</p>
          <p className="mt-3 text-sm font-semibold text-gray-800">Support Desk: Ground Floor</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h3 className="text-2xl font-bold text-gray-900">Send us a message</h3>
          <p className="mt-2 text-sm text-gray-600">Fill out this form and our team will contact you soon.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500"
                  name="name"
                  onChange={onChange}
                  placeholder="Your name"
                  readOnly={isProfileLocked}
                  type="text"
                  value={form.name}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500"
                  name="email"
                  onChange={onChange}
                  placeholder="you@example.com"
                  readOnly={isProfileLocked}
                  type="email"
                  value={form.email}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone (optional)</label>
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500"
                name="phone"
                onChange={onChange}
                placeholder="+91 9876543210"
                type="text"
                value={form.phone}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Subject</label>
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500"
                name="subject"
                onChange={onChange}
                placeholder="What can we help with?"
                type="text"
                value={form.subject}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
              <textarea
                className="h-36 w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500"
                name="message"
                onChange={onChange}
                placeholder="Write your message..."
                value={form.message}
              />
            </div>

            {!isLoggedIn ? (
              <p className="text-sm text-amber-700">Please login first to send message.</p>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

            <button
              className="rounded-xl bg-red-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
              disabled={saving}
              type="submit"
            >
              {saving ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900">Business Hours</h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-600">Monday - Friday</span>
                <span className="font-medium text-gray-900">10:00 AM - 7:00 PM</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-600">Saturday</span>
                <span className="font-medium text-gray-900">10:00 AM - 5:00 PM</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-600">Sunday</span>
                <span className="font-medium text-gray-900">Closed</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-red-800">Quick Support</h4>
            <p className="mt-2 text-sm text-red-700">
              For urgent order issues, call us directly and keep your Order ID ready.
            </p>
          </div>
        </aside>
      </section>

      <Footer />
    </div>
  );
};

export default Main;
