import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single testimonial
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: parseInt(id) },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Failed to fetch testimonial:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonial" },
      { status: 500 }
    );
  }
}

// PUT update testimonial
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        text: body.text,
        rating: parseInt(body.rating),
        isActive: body.isActive,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

// DELETE testimonial
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.testimonial.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Testimonial deleted" });
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
