"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/customer/account/orders/${orderId}`);
    }
  }, [status, router, orderId]);

  useEffect(() => {
    if (session?.user?.id && orderId) {
      fetchOrder();
    }
  }, [session, orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/customer/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      } else if (res.status === 404) {
        setError("Order not found");
      } else if (res.status === 403) {
        setError("You don't have permission to view this order");
      } else {
        setError("Failed to load order");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      processing: "bg-purple-100 text-purple-800 border-purple-300",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
      delivered: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusSteps = () => {
    const steps = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const currentIndex = steps.indexOf(order?.status);
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <Link href="/customer/account/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!session || !order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/customer/account/orders"
              className="text-blue-600 hover:underline text-sm mb-2 inline-block"
            >
              ← Back to Orders
            </Link>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-600">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Order Status Timeline (if not cancelled) */}
        {order.status !== "cancelled" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                {getStatusSteps().map((step, index) => (
                  <div
                    key={step.name}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.completed ? (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center capitalize ${
                        step.current ? "font-semibold" : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded">
                        {item.product?.image && (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold">
                          {item.product?.name || "Product"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-gray-600 whitespace-pre-line">
                    {order.shippingAddress}
                  </p>
                  {order.customerPhone && (
                    <p className="text-gray-600 mt-2">
                      Phone: {order.customerPhone}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Need Help */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you have questions about your order, please contact us.
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
