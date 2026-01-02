"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatPrice } from "@/lib/currency";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({
    salesByDay: [],
    ordersByStatus: [],
    topProducts: [],
    revenueByMonth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const productsRes = await fetch("/api/products");
      const products = await productsRes.json();

      const ordersRes = await fetch("/api/orders");
      const orders = await ordersRes.json();

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

      setRecentOrders(orders.slice(0, 5));

      // Prepare chart data
      prepareChartData(orders, products);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  function prepareChartData(orders, products) {
    // Sales by last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });

      last7Days.push({
        date: dateStr,
        sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length,
      });
    }

    // Orders by status
    const statusCounts = [
      {
        name: "Pending",
        value: orders.filter((o) => o.status === "pending").length,
        color: "#eab308",
      },
      {
        name: "Processing",
        value: orders.filter((o) => o.status === "processing").length,
        color: "#3b82f6",
      },
      {
        name: "Shipped",
        value: orders.filter((o) => o.status === "shipped").length,
        color: "#a855f7",
      },
      {
        name: "Delivered",
        value: orders.filter((o) => o.status === "delivered").length,
        color: "#22c55e",
      },
      {
        name: "Cancelled",
        value: orders.filter((o) => o.status === "cancelled").length,
        color: "#ef4444",
      },
    ].filter((item) => item.value > 0);

    // Top products by quantity sold
    const productSales = {};
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!productSales[item.product.name]) {
          productSales[item.product.name] = 0;
        }
        productSales[item.product.name] += item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Revenue by month (last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString("en-US", { month: "short" });

      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      });

      last6Months.push({
        month: monthStr,
        revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
      });
    }

    setChartData({
      salesByDay: last7Days,
      ordersByStatus: statusCounts,
      topProducts,
      revenueByMonth: last6Months,
    });
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
      value: formatPrice(stats.revenue),
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

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Last 7 Days */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  name="Sales ($)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#22c55e"
                  name="Orders"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#8b5cf6" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mb-8">
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
                      {formatPrice(order.total)}
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
      <div className="grid md:grid-cols-3 gap-6">
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
