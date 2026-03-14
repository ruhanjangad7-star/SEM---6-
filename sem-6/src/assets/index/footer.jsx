import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const categoryLinks = [
  { label: "Coding", to: "/categories/coding" },
  { label: "Gaming", to: "/categories/gaming" },
  { label: "Battery Backup", to: "/categories/battery%20backup" },
  { label: "Thin & Light", to: "/categories/thin%20%26%20light" },
];

const communityLinks = [
  { label: "WhatsApp", href: "https://wa.me/", icon: FaWhatsapp },
  { label: "Facebook", href: "https://www.facebook.com/", icon: FaFacebook },
  { label: "X", href: "https://x.com/", icon: FaXTwitter },
  { label: "Instagram", href: "https://www.instagram.com/", icon: FaInstagram },
];

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-3xl font-extrabold text-red-500">NEXAIRE LAPTOPS</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Category-based e-commerce platform built to help users choose laptops by real needs.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-red-400" to="/">Home</Link></li>
            <li><Link className="hover:text-red-400" to="/categories">Categories</Link></li>
            <li><Link className="hover:text-red-400" to="/contact-us">Contact Us</Link></li>
            <li><Link className="hover:text-red-400" to="/why-us">Why Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Popular Categories</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {categoryLinks.map((item) => (
              <li key={item.to}>
                <Link className="text-gray-400 hover:text-red-400" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Community</h3>
          <div className="mt-4 space-y-3 text-sm">
            {communityLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  className="flex items-center gap-2 hover:text-red-400"
                  href={item.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} NEXAIRE LAPTOPS. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

