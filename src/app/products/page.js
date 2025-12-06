import ProductCard from "@/components/ProductCard";
import ProductsClient from "@/components/ProductsClient";

export const metadata = {
  title: "Products | Your Shop Name",
  description: "Browse our collection of quality products",
};

async function getProducts() {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/products`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductsClient initialProducts={products} />;
}
