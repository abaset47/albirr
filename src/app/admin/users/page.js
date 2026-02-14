"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [sendingReset, setSendingReset] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAdmin) {
        // Update existing admin
        const res = await fetch(`/api/admin/${editingAdmin.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchAdmins();
          alert("Admin updated successfully!");
        } else {
          const error = await res.json();
          alert(error.error || "Failed to update admin");
        }
      } else {
        // Create new admin
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchAdmins();
          alert("Admin created successfully!");
        } else {
          const error = await res.json();
          alert(error.error || "Failed to create admin");
        }
      }

      setFormData({ name: "", email: "", password: "" });
      setShowForm(false);
      setEditingAdmin(null);
    } catch (error) {
      console.error("Failed to save admin:", error);
      alert("Failed to save admin");
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "", // Don't populate password
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this admin user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchAdmins();
        alert("Admin deleted successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Failed to delete admin:", error);
      alert("Failed to delete admin");
    }
  };

  const handleSendResetLink = async (adminId) => {
    if (
      !confirm(
        "Send password reset email to this admin? A temporary password will be generated and sent."
      )
    ) {
      return;
    }

    setSendingReset(adminId);

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });

      if (res.ok) {
        alert(
          "Password reset email sent successfully! The admin will receive a temporary password."
        );
      } else {
        const error = await res.json();
        alert(error.error || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Failed to send reset email:", error);
      alert("Failed to send reset email");
    } finally {
      setSendingReset(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAdmin(null);
    setFormData({ name: "", email: "", password: "" });
  };

  if (loading) {
    return <div className="text-center py-12">Loading admins...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Admin Users Management</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage administrators who can access the admin panel
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add New Admin</Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingAdmin ? "Edit Admin User" : "Add New Admin User"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter admin name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password{" "}
                  {editingAdmin ? "(leave blank to keep current)" : "*"}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingAdmin
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  required={!editingAdmin}
                />
                {!editingAdmin && (
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters recommended
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingAdmin ? "Update Admin" : "Create Admin"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <span className="font-medium">{admin.name}</span>
                    </td>
                    <td className="p-4">{admin.email}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(admin)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSendResetLink(admin.id)}
                          disabled={sendingReset === admin.id}
                        >
                          {sendingReset === admin.id
                            ? "Sending..."
                            : "Reset Password"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(admin.id)}
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

      {admins.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-12 text-center text-gray-500">
            No admin users yet. Click "Add New Admin" to create one.
          </CardContent>
        </Card>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          ℹ️ About Admin Users
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Admin users can access the admin panel at{" "}
            <code className="bg-blue-100 px-1 rounded">/admin/login</code>
          </li>
          <li>
            • They have full access to manage products, orders, testimonials,
            and other admins
          </li>
          <li>• You cannot delete your own admin account while logged in</li>
          <li>
            • Reset Password sends a temporary password via email - admin should
            change it immediately
          </li>
          <li>
            • Keep admin credentials secure and only create accounts for trusted
            staff
          </li>
        </ul>
      </div>
    </div>
  );
}
