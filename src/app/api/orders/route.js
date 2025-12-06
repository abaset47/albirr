import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendOrderEmailToAdmin,
  sendOrderConfirmationToCustomer,
} from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, items, total } = body;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        total,
        status: "pending",
        orderItems: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Prepare email data
    const emailData = {
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.orderItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
    };

    // Send emails
    await sendOrderEmailToAdmin(emailData);
    await sendOrderConfirmationToCustomer(emailData);

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        message: "Order placed successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}

// Get all orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
