import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - fetch user's cart
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json([]);
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: parseInt(session.user.id) },
    include: { product: true },
  });

  return NextResponse.json(cartItems);
}

// POST - add/update item in cart
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity } = await request.json();
  const userId = parseInt(session.user.id);

  const cartItem = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity },
    create: { userId, productId, quantity },
    include: { product: true },
  });

  return NextResponse.json(cartItem);
}

// DELETE - remove item or clear cart
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (productId) {
    await prisma.cartItem.deleteMany({
      where: { userId, productId: parseInt(productId) },
    });
  } else {
    // Clear entire cart
    await prisma.cartItem.deleteMany({ where: { userId } });
  }

  return NextResponse.json({ success: true });
}
