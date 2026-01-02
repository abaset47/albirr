"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    text: "",
    rating: 5,
    isActive: true,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTestimonial) {
        const res = await fetch(`/api/testimonials/${editingTestimonial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchTestimonials();
          alert("Testimonial updated successfully!");
        }
      } else {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchTestimonials();
          alert("Testimonial created successfully!");
        }
      }

      setFormData({ name: "", text: "", rating: 5, isActive: true });
      setShowForm(false);
      setEditingTestimonial(null);
    } catch (error) {
      console.error("Failed to save testimonial:", error);
      alert("Failed to save testimonial");
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      text: testimonial.text,
      rating: testimonial.rating,
      isActive: testimonial.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchTestimonials();
        alert("Testimonial deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete testimonial:", error);
      alert("Failed to delete testimonial");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTestimonial(null);
    setFormData({ name: "", text: "", rating: 5, isActive: true });
  };

  if (loading) {
    return <div className="text-center py-12">Loading testimonials...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Testimonials Management</h2>
        <Button onClick={() => setShowForm(true)}>+ Add New Testimonial</Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Fatima A."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Testimonial Text *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 min-h-[100px]"
                  placeholder="Enter customer feedback..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({formData.rating} star{formData.rating !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Display on homepage</span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingTestimonial
                    ? "Update Testimonial"
                    : "Add Testimonial"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="relative">
            <CardContent className="p-6">
              {!testimonial.isActive && (
                <div className="absolute top-3 right-3 bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
                  Hidden
                </div>
              )}

              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-600 mb-4 italic text-sm">
                "{testimonial.text}"
              </p>

              {/* Name */}
              <p className="font-semibold text-gray-800 mb-4">
                {testimonial.name}
              </p>

              {/* Date */}
              <p className="text-xs text-gray-400 mb-4">
                {new Date(testimonial.createdAt).toLocaleDateString()}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(testimonial)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(testimonial.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            No testimonials yet. Click "Add New Testimonial" to create one.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
