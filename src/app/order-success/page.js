"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Order Placed Successfully!
              </h1>
              <p className="text-gray-600 mb-4">
                Thank you for your order. We've sent a confirmation email with
                your order details.
              </p>
              {orderId && (
                <div className="bg-gray-50 p-4 rounded-lg inline-block">
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="text-xl font-bold">#{orderId}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Link href="/products" className="block">
                <Button className="w-full" size="lg">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t text-sm text-gray-600">
              <p>You will receive updates about your order via email.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
