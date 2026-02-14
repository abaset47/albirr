import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single product
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      image: body.image,
      category: body.category,
      stock: parseInt(body.stock),
      inStock: body.inStock !== undefined ? body.inStock : true,
    };

    // Handle images array
    if (body.images !== undefined) {
      updateData.images = body.images;
    }

    // Only add optional fields if they exist
    if (body.features !== undefined) updateData.features = body.features;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isNewArrival !== undefined)
      updateData.isNewArrival = body.isNewArrival;
    if (body.isFlashSale !== undefined)
      updateData.isFlashSale = body.isFlashSale;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
