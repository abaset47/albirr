"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchOrders();
        alert("Order status updated!");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Failed to update order status");
    }
  }

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Orders Management</h2>
        <div className="text-lg font-semibold">
          Total Orders: {orders.length}
        </div>
      </div>

      {/* Status Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              All ({orders.length})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({orders.filter((o) => o.status === "pending").length})
            </Button>
            <Button
              variant={statusFilter === "processing" ? "default" : "outline"}
              onClick={() => setStatusFilter("processing")}
            >
              Processing (
              {orders.filter((o) => o.status === "processing").length})
            </Button>
            <Button
              variant={statusFilter === "shipped" ? "default" : "outline"}
              onClick={() => setStatusFilter("shipped")}
            >
              Shipped ({orders.filter((o) => o.status === "shipped").length})
            </Button>
            <Button
              variant={statusFilter === "delivered" ? "default" : "outline"}
              onClick={() => setStatusFilter("delivered")}
            >
              Delivered ({orders.filter((o) => o.status === "delivered").length}
              )
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            No orders found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">
                      Customer Details:
                    </p>
                    <p className="text-sm">{order.customerName}</p>
                    <p className="text-sm text-gray-600">
                      {order.customerEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold mb-1">Order Total:</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4 mb-4">
                  <p className="font-semibold mb-3">Order Items:</p>
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update Buttons */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Update Status:</p>
                  <div className="flex flex-wrap gap-2">
                    {order.status !== "processing" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateOrderStatus(order.id, "processing")
                        }
                      >
                        Mark as Processing
                      </Button>
                    )}
                    {order.status !== "shipped" &&
                      order.status !== "delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                        >
                          Mark as Shipped
                        </Button>
                      )}
                    {order.status !== "delivered" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    {order.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to cancel this order?"
                            )
                          ) {
                            updateOrderStatus(order.id, "cancelled");
                          }
                        }}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
