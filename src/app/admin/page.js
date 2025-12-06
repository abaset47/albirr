"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch products
      const productsRes = await fetch("/api/products");
      const products = await productsRes.json();

      // Fetch orders
      const ordersRes = await fetch("/api/orders");
      const orders = await ordersRes.json();

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingCount = orders.filter(
        (order) => order.status === "pending"
      ).length;
      const lowStock = products.filter((product) => product.stock < 10).length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: pendingCount,
        revenue: totalRevenue,
        lowStockProducts: lowStock,
      });

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "processing":
        return "text-blue-600";
      case "shipped":
        return "text-purple-600";
      case "delivered":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: "📦",
      link: "/admin/products",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "🛒",
      link: "/admin/orders",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: "⏳",
      color: stats.pendingOrders > 0 ? "text-yellow-600" : "",
      link: "/admin/orders",
    },
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: "💰",
      link: "/admin/orders",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <Button onClick={() => fetchDashboardData()}>Refresh Data</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link key={index} href={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <span className="text-2xl">{stat.icon}</span>
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color || ""}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800">Low Stock Alert</p>
                <p className="text-sm text-yellow-700">
                  {stats.lowStockProducts} product
                  {stats.lowStockProducts !== 1 ? "s" : ""} have low stock (less
                  than 10 units)
                </p>
              </div>
              <Link href="/admin/products" className="ml-auto">
                <Button variant="outline" size="sm">
                  View Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              View All Orders
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center border-b pb-3 last:border-b-0"
                >
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      ${order.total.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.orderItems.length} item
                      {order.orderItems.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Link href="/admin/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">📦</div>
              <h3 className="font-semibold mb-1">Manage Products</h3>
              <p className="text-sm text-gray-600">
                Add, edit or remove products
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="font-semibold mb-1">View Orders</h3>
              <p className="text-sm text-gray-600">Manage customer orders</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🏪</div>
              <h3 className="font-semibold mb-1">View Store</h3>
              <p className="text-sm text-gray-600">See your live storefront</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
