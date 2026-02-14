import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow customers to access this endpoint
    if (session.user.role === "admin") {
      return NextResponse.json(
        { error: "Admins should use the admin orders endpoint" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const orders = await prisma.order.findMany({
      where: {
        userId: parseInt(session.user.id),
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit && { take: parseInt(limit) }),
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
