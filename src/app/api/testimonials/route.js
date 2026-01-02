import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all testimonials
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST create new testimonial
export async function POST(request) {
  try {
    const body = await request.json();
    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        text: body.text,
        rating: parseInt(body.rating) || 5,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
