const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

function formatPrice(amount) {
  return `₹${amount.toFixed(2)}`;
}

export async function sendOrderEmailToAdmin(orderData) {
  const { orderId, customerName, customerEmail, items, total } = orderData;

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
      <h2 style="color: #2563eb;">New Order Received! 🎉</h2>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Customer Email:</strong> ${customerEmail}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
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

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      
      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from your shop.
      </p>
    </div>
  `;

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.ADMIN_EMAIL,
            Name: "Your Shop",
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
        },
      ],
    });

    console.log("Email sent successfully:", request.body);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderConfirmationToCustomer(orderData) {
  const { orderId, customerName, customerEmail, items, total } = orderData;

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
      <h2 style="color: #2563eb;">Thank You for Your Order! 🎉</h2>
      
      <p>Hi ${customerName},</p>
      <p>We've received your order and we're getting it ready. You'll receive a shipping notification once your order is on its way.</p>

      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
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

      <div style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px;">
        <p>Total: ${formatPrice(total)}</p>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      
      <p style="color: #6b7280; font-size: 14px;">
        If you have any questions, please contact us at ${
          process.env.ADMIN_EMAIL
        }
      </p>
    </div>
  `;

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.ADMIN_EMAIL,
            Name: "Your Shop",
          },
          To: [
            {
              Email: customerEmail,
              Name: customerName,
            },
          ],
          Subject: `Order Confirmation #${orderId}`,
          TextPart: `Thank you for your order! Order ID: #${orderId}. Total: ${formatPrice(
            total
          )}`,
          HTMLPart: htmlContent,
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
