"use client";

import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function ProductsClient({ initialProducts }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const categories = [
    "All",
    ...new Set(initialProducts.map((p) => p.category)),
  ];

  // Filter products
  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "under50" && product.price < 50) ||
      (priceRange === "50to100" &&
        product.price >= 50 &&
        product.price <= 100) ||
      (priceRange === "over100" && product.price > 100);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Our Products</h1>
          <p className="text-gray-600">Discover our amazing collection</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Category Filters */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={priceRange === "all" ? "default" : "outline"}
                  onClick={() => setPriceRange("all")}
                >
                  All Prices
                </Button>
                <Button
                  variant={priceRange === "under50" ? "default" : "outline"}
                  onClick={() => setPriceRange("under50")}
                >
                  Under $50
                </Button>
                <Button
                  variant={priceRange === "50to100" ? "default" : "outline"}
                  onClick={() => setPriceRange("50to100")}
                >
                  $50 - $100
                </Button>
                <Button
                  variant={priceRange === "over100" ? "default" : "outline"}
                  onClick={() => setPriceRange("over100")}
                >
                  Over $100
                </Button>
              </div>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Sort By:</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {sortedProducts.length} of {initialProducts.length} products
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No products found</p>
            <Button
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setPriceRange("all");
                setSortBy("default");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
