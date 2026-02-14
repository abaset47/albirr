const QRCode = require("qrcode");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID;

// Your UPI details
const UPI_CONFIG = {
  upiId: process.env.UPI_ID || "yourname@paytm",
  payeeName: process.env.UPI_PAYEE_NAME || "AlBirr Learning House",
};

/**
 * Generate UPI QR Code as Buffer
 */
async function generateUPIQRCodeBuffer({
  upiId,
  name,
  amount,
  transactionNote,
}) {
  const upiString = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(
    transactionNote
  )}`;

  try {
    const qrCodeBuffer = await QRCode.toBuffer(upiString, {
      errorCorrectionLevel: "M",
      type: "png",
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrCodeBuffer;
  } catch (error) {
    console.error("Error generating UPI QR Code Buffer:", error);
    throw new Error("Failed to generate UPI QR Code Buffer");
  }
}

export async function sendTelegramNotification(message) {
  const botToken = TELEGRAM_BOT_TOKEN;
  const chatId = TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram credentials not configured");
    return { success: false, error: "Telegram not configured" };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log("Telegram notification sent successfully");
      return { success: true };
    } else {
      console.error("Telegram API error:", data);
      return { success: false, error: data.description };
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Telegram notification with UPI QR Code
 */
export async function sendTelegramNotificationWithQR(order) {
  const botToken = TELEGRAM_BOT_TOKEN;
  const chatId = TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram credentials not configured");
    return { success: false, error: "Telegram not configured" };
  }

  try {
    // Prepare order items text
    const itemsList = order.orderItems
      .map(
        (item) =>
          `  • ${item.product.name} - Qty: ${item.quantity} × ₹${
            item.price
          } = ₹${(item.quantity * item.price).toFixed(2)}`
      )
      .join("\n");

    // Prepare main message text
    const message = `
🛍️ <b>NEW ORDER RECEIVED!</b>

━━━━━━━━━━━━━━━━━
📋 <b>Order Details:</b>
<b>Order ID:</b> #${order.id}
<b>Status:</b> ${order.status}
<b>Total Amount:</b> ₹${order.total.toFixed(2)}

👤 <b>Customer Information:</b>
<b>Name:</b> ${order.customerName}
<b>Email:</b> ${order.customerEmail}
${order.customerPhone ? `<b>Phone:</b> ${order.customerPhone}` : ""}

📦 <b>Items Ordered:</b>
${itemsList}

⏰ <b>Order Time:</b> ${new Date(order.createdAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    })}

━━━━━━━━━━━━━━━━━
💳 <b>UPI Payment Details:</b>
<b>UPI ID:</b> <code>${UPI_CONFIG.upiId}</code>
<b>Amount:</b> ₹${order.total.toFixed(2)}
<b>Reference:</b> Order #${order.id}

🔗 View in admin: ${
      process.env.SITE_URL || "http://localhost:3000"
    }/admin/orders

<i>QR Code will be sent in the next message</i>
    `.trim();

    // First, send the text message
    const textResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const textData = await textResponse.json();
    if (!textData.ok) {
      throw new Error(`Failed to send message: ${textData.description}`);
    }

    // Generate UPI QR Code
    const qrCodeBuffer = await generateUPIQRCodeBuffer({
      upiId: UPI_CONFIG.upiId,
      name: UPI_CONFIG.payeeName,
      amount: order.total,
      transactionNote: `Order #${order.id} - AlBirr`,
    });

    // Send QR code as photo
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append(
      "photo",
      new Blob([qrCodeBuffer], { type: "image/png" }),
      "upi-qr-code.png"
    );
    formData.append(
      "caption",
      `💳 <b>UPI QR Code for Order #${
        order.id
      }</b>\n\n<b>Amount:</b> ₹${order.total.toFixed(
        2
      )}\n<b>UPI ID:</b> <code>${
        UPI_CONFIG.upiId
      }</code>\n\n📱 Scan this QR code to receive payment from customer`
    );
    formData.append("parse_mode", "HTML");

    const photoResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      {
        method: "POST",
        body: formData,
      }
    );

    const photoData = await photoResponse.json();
    if (!photoData.ok) {
      throw new Error(`Failed to send QR code: ${photoData.description}`);
    }

    console.log("Telegram notification with QR code sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Failed to send Telegram notification with QR:", error);
    return { success: false, error: error.message };
  }
}

export function formatOrderNotification(order) {
  const itemsList = order.orderItems
    .map(
      (item) => `  • ${item.product.name} (${item.quantity}x ₹${item.price})`
    )
    .join("\n");

  return `
🛍️ <b>NEW ORDER RECEIVED!</b>

📋 Order ID: #${order.id}
👤 Customer: ${order.customerName}
📧 Email: ${order.customerEmail}
💰 Total: ₹${order.total.toFixed(2)}
📅 Date: ${new Date(order.createdAt).toLocaleString("en-IN")}

📦 <b>Items:</b>
${itemsList}

💳 <b>UPI ID:</b> <code>${UPI_CONFIG.upiId}</code>

🔗 View in admin panel: ${
    process.env.SITE_URL || "http://localhost:3000"
  }/admin/orders
  `.trim();
}
