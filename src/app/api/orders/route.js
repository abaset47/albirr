import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendOrderEmailToAdmin,
  sendOrderConfirmationToCustomer,
} from "@/lib/email";
import { sendTelegramNotificationWithQR } from "@/lib/telegram";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      shippingAddress,
    } = body;

    // Prepare order data
    const orderData = {
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      total,
      status: "pending",
      shippingAddress: shippingAddress || null,
      orderItems: {
        create: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    };

    // If user is logged in, link the order to their account
    if (session?.user?.id && session.user.role !== "admin") {
      orderData.userId = parseInt(session.user.id);
    }

    // Create order in database
    const order = await prisma.order.create({
      data: orderData,
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
      shippingAddress: order.shippingAddress,
    };

    // Send emails with UPI QR codes (async, don't wait)
    Promise.all([
      sendOrderEmailToAdmin(emailData),
      sendOrderConfirmationToCustomer(emailData),
    ]).catch((error) => {
      console.error("Error sending emails:", error);
    });

    // Send Telegram notification with UPI QR code (async, don't wait)
    sendTelegramNotificationWithQR(order).catch((error) => {
      console.error("Error sending Telegram notification:", error);
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        message:
          "Order placed successfully. Please complete the payment using the UPI QR code sent to your email.",
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

// Get all orders (admin only - keep this for admin panel)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can access all orders
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
