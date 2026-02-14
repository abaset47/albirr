const Mailjet = require("node-mailjet");
const QRCode = require("qrcode");

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

// Your UPI details - Add these to your .env file
const UPI_CONFIG = {
  upiId: process.env.UPI_ID || "yourname@paytm", // e.g., albirr@paytm
  payeeName: process.env.UPI_PAYEE_NAME || "AlBirr Learning House",
};

function formatPrice(amount) {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Generate UPI QR Code as Buffer for email attachments
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
      width: 300,
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

export async function sendOrderEmailToAdmin(orderData) {
  const { orderId, customerName, customerEmail, items, total } = orderData;

  // Generate UPI QR Code
  const qrCodeBuffer = await generateUPIQRCodeBuffer({
    upiId: UPI_CONFIG.upiId,
    name: UPI_CONFIG.payeeName,
    amount: total,
    transactionNote: `Order #${orderId} - AlBirr`,
  });

  const qrCodeBase64 = qrCodeBuffer.toString("base64");

  // Create items list HTML
  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
        item.name
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatPrice(
        item.price
      )}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatPrice(
        item.quantity * item.price
      )}</td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #E91E63;">New Order Received! 🎉</h2>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Customer Email:</strong> ${customerEmail}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleString(
          "en-IN"
        )}</p>
      </div>

      <h3>Order Items:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #e5e7eb;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: left;">Quantity</th>
            <th style="padding: 10px; text-align: left;">Price</th>
            <th style="padding: 10px; text-align: left;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px;">
        <p>Total: ${formatPrice(total)}</p>
      </div>

      <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; border: 2px solid #FF9800; text-align: center;">
        <h3 style="color: #FF9800; margin-bottom: 15px;">💳 UPI Payment QR Code</h3>
        <div style="margin: 20px auto; padding: 15px; background: white; border-radius: 8px; display: inline-block;">
          <img src="cid:upi-qr-code" alt="UPI QR Code" width="250" height="250" />
        </div>
        <p style="font-weight: bold; font-size: 18px; color: #E91E63; margin: 15px 0;">
          Amount: ${formatPrice(total)}
        </p>
        <div style="background: #e3f2fd; padding: 10px; border-radius: 4px; margin: 10px 0;">
          <strong>UPI ID:</strong> <code style="background: white; padding: 5px 10px; border-radius: 3px; color: #1976d2;">${
            UPI_CONFIG.upiId
          }</code>
        </div>
        <p style="font-size: 13px; color: #666; margin-top: 10px;">
          Scan this QR code to receive payment from the customer
        </p>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      
      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from AlBirr - The Learning House.
      </p>
    </div>
  `;

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.ADMIN_EMAIL,
            Name: "AlBirr - The Learning House",
          },
          To: [
            {
              Email: process.env.ADMIN_EMAIL,
              Name: "Admin",
            },
          ],
          Subject: `New Order #${orderId} - ${customerName}`,
          TextPart: `New order received from ${customerName} (${customerEmail}). Order ID: #${orderId}. Total: ${formatPrice(
            total
          )}`,
          HTMLPart: htmlContent,
          InlinedAttachments: [
            {
              ContentType: "image/png",
              Filename: "upi-qr-code.png",
              ContentID: "upi-qr-code",
              Base64Content: qrCodeBase64,
            },
          ],
        },
      ],
    });

    console.log("Admin email sent successfully:", request.body);
    return { success: true };
  } catch (error) {
    console.error("Failed to send admin email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderConfirmationToCustomer(orderData) {
  const {
    orderId,
    customerName,
    customerEmail,
    items,
    total,
    shippingAddress,
  } = orderData;

  // Generate UPI QR Code
  const qrCodeBuffer = await generateUPIQRCodeBuffer({
    upiId: UPI_CONFIG.upiId,
    name: UPI_CONFIG.payeeName,
    amount: total,
    transactionNote: `Order #${orderId} - AlBirr`,
  });

  const qrCodeBase64 = qrCodeBuffer.toString("base64");

  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
        item.name
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatPrice(
        item.price
      )}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatPrice(
        item.quantity * item.price
      )}</td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 3px solid #E91E63;
        }
        .logo {
          font-family: 'Dancing Script', cursive;
          font-size: 36px;
          font-weight: bold;
        }
        .logo span:nth-child(1) { color: #E91E63; } /* A - Magenta */
        .logo span:nth-child(2) { color: #FF9800; } /* l - Orange */
        .logo span:nth-child(3) { color: #FFC107; } /* B - Yellow */
        .logo span:nth-child(4) { color: #00BCD4; } /* i - Teal */
        .logo span:nth-child(5) { color: #9C27B0; } /* r - Purple */
        .logo span:nth-child(6) { color: #E91E63; } /* r - Magenta */
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <span>A</span><span>l</span><span>B</span><span>i</span><span>r</span><span>r</span>
        </div>
        <p style="margin: 10px 0; color: #666;">The Learning House</p>
      </div>

      <div style="padding: 30px 20px;">
        <h2>Thank You for Your Order! 🎉</h2>
        
        <p>Dear ${customerName},</p>
        <p>Jazakallah Khair for choosing AlBirr! We've received your order and it's being processed.</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>
          ${
            shippingAddress
              ? `
          <p><strong>Delivery Address:</strong><br>
            ${shippingAddress.address}<br>
            ${shippingAddress.city}, ${shippingAddress.state} ${
                  shippingAddress.pincode
                }<br>
            ${shippingAddress.country || "India"}
          </p>
          `
              : ""
          }
        </div>

        <h3>Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #e5e7eb;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #E91E63;">
          <p>Total: ${formatPrice(total)}</p>
        </div>

        <div style="background-color: #fff3e0; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #FF9800; text-align: center;">
          <h3 style="color: #FF9800; margin-bottom: 15px;">💳 Complete Your Payment</h3>
          <p style="font-size: 18px; margin-bottom: 15px;">Scan the QR code below to pay via UPI</p>
          
          <div style="margin: 20px auto; padding: 15px; background: white; border-radius: 8px; display: inline-block;">
            <img src="cid:upi-qr-code" alt="UPI QR Code" width="250" height="250" />
          </div>

          <p style="font-weight: bold; font-size: 20px; color: #E91E63; margin: 15px 0;">
            Amount: ${formatPrice(total)}
          </p>

          <div style="text-align: left; margin: 20px 0; padding: 15px; background: white; border-radius: 8px;">
            <strong>How to Pay:</strong>
            <ol style="margin: 10px 0; padding-left: 25px;">
              <li style="margin: 8px 0;">Open any UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.)</li>
              <li style="margin: 8px 0;">Scan the QR code above</li>
              <li style="margin: 8px 0;">Verify the amount: ${formatPrice(
                total
              )}</li>
              <li style="margin: 8px 0;">Complete the payment</li>
            </ol>
            
            <p style="margin-top: 15px;"><strong>Or pay directly to our UPI ID:</strong></p>
            <div style="text-align: center;">
              <code style="background: #e3f2fd; padding: 8px 12px; border-radius: 4px; display: inline-block; margin: 10px 0; font-weight: bold; color: #1976d2;">${
                UPI_CONFIG.upiId
              }</code>
            </div>
            
            <p style="margin-top: 15px; font-size: 13px; color: #666;">
              <strong>Note:</strong> Please mention Order ID #${orderId} in the payment remarks
            </p>
          </div>
        </div>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
          <strong>📦 What's Next?</strong><br>
          Once we receive your payment, we'll confirm and start processing your order. 
          You'll receive another email with tracking details once your order is shipped.
        </div>

        <p style="margin-top: 20px;">If you have any questions, please feel free to contact us at ${
          process.env.ADMIN_EMAIL
        }</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>Team AlBirr</strong><br>
          <em>Nurturing Young Minds with Islamic Knowledge</em> 🌙
        </p>
      </div>

      <div style="text-align: center; padding: 20px; color: #666; border-top: 1px solid #dee2e6; margin-top: 30px;">
        <p>AlBirr - The Learning House</p>
        <p>Islamic Educational Products for Children</p>
        <p style="font-size: 12px; color: #999;">
          This is an automated email. Please do not reply directly to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.ADMIN_EMAIL,
            Name: "AlBirr - The Learning House",
          },
          To: [
            {
              Email: customerEmail,
              Name: customerName,
            },
          ],
          Subject: `Order Confirmation #${orderId} - Complete Your Payment`,
          TextPart: `Thank you for your order! Order ID: #${orderId}. Total: ${formatPrice(
            total
          )}. Please complete your UPI payment to: ${UPI_CONFIG.upiId}`,
          HTMLPart: htmlContent,
          InlinedAttachments: [
            {
              ContentType: "image/png",
              Filename: "upi-qr-code.png",
              ContentID: "upi-qr-code",
              Base64Content: qrCodeBase64,
            },
          ],
        },
      ],
    });

    console.log("Confirmation email sent to customer:", request.body);
    return { success: true };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return { success: false, error: error.message };
  }
}
