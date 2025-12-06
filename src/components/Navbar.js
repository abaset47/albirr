"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { getCartCount } = useCart();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ShopName
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-blue-600"
            >
              Products
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </div>

          {/* Cart Button */}
          <Link href="/cart">
            <Button variant="outline">Cart ({getCartCount()})</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
