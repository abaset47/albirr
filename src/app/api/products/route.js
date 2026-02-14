import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        image: body.image,
        images: body.images || [], // Additional gallery images
        category: body.category,
        stock: parseInt(body.stock),
        features: body.features || [],
        details: body.details || "",
        inStock: body.inStock !== false,
        isFeatured: body.isFeatured || false,
        isNewArrival: body.isNewArrival || false,
        isFlashSale: body.isFlashSale || false,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
