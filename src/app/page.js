import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// This is a Server Component by default in Next.js App Router
export const metadata = {
  title: "Home | Your Shop Name",
  description: "Discover amazing products at great prices",
};

export default function HomePage() {
  const features = [
    { title: "Quality Products", description: "Carefully curated selection" },
    { title: "Fast Shipping", description: "Get your orders quickly" },
    { title: "Secure Payment", description: "Safe and encrypted checkout" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Your Shop</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover amazing products that make your life better
          </p>
          <Link href="/products">
            <Button size="lg" variant="secondary">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Shopping?</h2>
          <p className="text-gray-600 mb-8">
            Browse our collection of premium products
          </p>
          <Link href="/products">
            <Button size="lg">View Products</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
