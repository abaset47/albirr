"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { formatPrice } from "@/lib/currency";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    images: [], // Additional images array
    category: "",
    stock: "",
    details: "",
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (res.ok) {
          await fetchProducts();
          alert("Product updated successfully!");
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (res.ok) {
          await fetchProducts();
          alert("Product created successfully!");
        }
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      images: [],
      category: "",
      stock: "",
      details: "",
      isFeatured: false,
      isNewArrival: false,
      isFlashSale: false,
    });
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      images: product.images || [],
      category: product.category,
      stock: product.stock.toString(),
      details: product.details || "",
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false,
      isFlashSale: product.isFlashSale || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchProducts();
        alert("Product deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  // Upload primary image
  const handlePrimaryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
        alert("Primary image uploaded successfully!");
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Upload additional images (multiple)
  const handleAdditionalImagesUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", files[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        alert(`${uploadedUrls.length} image(s) uploaded successfully!`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload some images");
    } finally {
      setUploading(false);
    }
  };

  // Remove an additional image
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  // Set an additional image as primary
  const handleSetAsPrimary = (imageUrl) => {
    setFormData((prev) => {
      // Add current primary to additional images if it exists
      const newImages = prev.image
        ? [...prev.images.filter((img) => img !== imageUrl), prev.image]
        : prev.images.filter((img) => img !== imageUrl);

      return {
        ...prev,
        image: imageUrl,
        images: newImages,
      };
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Products Management</h2>
        <Button onClick={() => setShowForm(true)}>+ Add New Product</Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Details (Optional)
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock
                  </label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Flashcards">Flashcards</option>
                  <option value="Binders">Binders</option>
                  <option value="Story Boxes">Story Boxes</option>
                  <option value="Quran Learning">Quran Learning</option>
                  <option value="Islamic Books">Islamic Books</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              {/* ============================================ */}
              {/* PRIMARY IMAGE SECTION */}
              {/* ============================================ */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-3">
                  Primary Image (Main Display Image) *
                </label>

                {formData.image && (
                  <div className="mb-3">
                    <div className="relative w-40 h-40 border-2 border-blue-500 rounded overflow-hidden">
                      <Image
                        src={formData.image}
                        alt="Primary"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mb-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePrimaryImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block">
                      {uploading ? "Uploading..." : "Upload Primary Image"}
                    </div>
                  </label>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  Or enter image URL:
                </p>
                <Input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              {/* ============================================ */}
              {/* ADDITIONAL IMAGES SECTION */}
              {/* ============================================ */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-3">
                  Additional Gallery Images (Optional)
                </label>

                {/* Display existing additional images */}
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative w-24 h-24 border rounded overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={`Gallery ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {/* Action buttons overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetAsPrimary(imageUrl)}
                            className="p-1 bg-blue-600 text-white rounded text-xs"
                            title="Set as primary"
                          >
                            ★
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1 bg-red-600 text-white rounded text-xs"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload multiple images */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-block">
                    {uploading ? "Uploading..." : "+ Add More Images"}
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  You can select multiple images at once. Hover over images to
                  set as primary or remove.
                </p>
              </div>

              {/* Homepage Sections */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-3">
                  Display in Homepage Sections:
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isNewArrival: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      Show in "New Arrivals" carousel
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFlashSale}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFlashSale: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      Show in "Flash Sale" section
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Mark as Featured Product</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Stock</th>
                  <th className="text-left p-4">Images</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{product.category}</td>
                    <td className="p-4">{formatPrice(product.price)}</td>
                    <td className="p-4">
                      <span
                        className={
                          product.stock < 10 ? "text-red-600 font-semibold" : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {1 + (product.images?.length || 0)} image(s)
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
