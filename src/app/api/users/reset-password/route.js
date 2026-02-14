import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
const Mailjet = require("node-mailjet");

function getMailjet() {
  return Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE,
  );
}

export async function POST(request) {
  try {
    const { userId } = await request.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Create reset link
    const resetLink = `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    // Send email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9B59B6;">Password Reset Request</h2>
        
        <p>Hi ${user.name},</p>
        
        <p>You requested to reset your password. Click the button below to reset it:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #9B59B6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetLink}</p>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `;

    await getMailjet()
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.ADMIN_EMAIL,
              Name: "AlBirr Shop",
            },
            To: [
              {
                Email: user.email,
                Name: user.name,
              },
            ],
            Subject: "Reset Your Password - AlBirr Shop",
            TextPart: `Reset your password by clicking this link: ${resetLink}`,
            HTMLPart: htmlContent,
          },
        ],
      });

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Failed to send reset email:", error);
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 500 },
    );
  }
}
