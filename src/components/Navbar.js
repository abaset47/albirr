"use client";

import Link from "next/link";
import { useState } from "react";
import { Dancing_Script } from "next/font/google";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// AL-BIRR Brand Colors
const brandColors = {
  magenta: "#E91E8C",
  orange: "#FF8C42",
  yellow: "#F7DC6F",
  teal: "#48C9B0",
  purple: "#9B59B6",
};

export default function Navbar() {
  const { getCartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Products", href: "/products" },
    { name: "Flashcards", href: "/products?category=flashcards" },
    { name: "Binders", href: "/products?category=binders" },
    { name: "Story Boxes", href: "/products?category=stories" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <header className="bg-white sticky top-0 z-50">
      {/* Main Navbar */}
      <nav className="border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span
                className={`${dancingScript.className} text-2xl md:text-3xl font-bold`}
              >
                <span style={{ color: brandColors.teal }}>A</span>
                <span style={{ color: brandColors.orange }}>L</span>
                <span style={{ color: brandColors.magenta }}>-</span>
                <span style={{ color: brandColors.yellow }}>B</span>
                <span style={{ color: brandColors.purple }}>I</span>
                <span style={{ color: brandColors.teal }}>R</span>
                <span style={{ color: brandColors.magenta }}>R</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors relative group"
                >
                  {link.name}
                  <span
                    className="absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                    style={{ backgroundColor: brandColors.magenta }}
                  />
                </Link>
              ))}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search Button */}
              <button
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account Button */}
              <Link
                href="/account"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center"
                    style={{ backgroundColor: brandColors.magenta }}
                  >
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar - Expandable */}
        {searchOpen && (
          <div className="border-t border-gray-100 py-4">
            <div className="container mx-auto px-4">
              <div className="relative max-w-xl mx-auto">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-full focus:outline-none focus:border-gray-300 text-sm"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="my-2" />
              <Link
                href="/account"
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                My Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
