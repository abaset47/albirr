import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adminId } = await request.json();

    // Get admin
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(adminId) },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex"); // 16 character password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update admin password
    await prisma.admin.update({
      where: { id: parseInt(adminId) },
      data: {
        password: hashedPassword,
      },
    });

    // Create admin login link
    const loginLink = `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }/admin/login`;

    // Send email with temporary password
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9B59B6;">Password Reset - AlBirr Admin</h2>
        
        <p>Hi ${admin.name},</p>
        
        <p>Your admin password has been reset. Here are your new login credentials:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${admin.email}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${tempPassword}</code></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginLink}" 
             style="background-color: #9B59B6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Admin Panel
          </a>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>⚠️ Important:</strong> Please change this temporary password immediately after logging in for security.</p>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If you didn't request this password reset, please contact the system administrator immediately.
        </p>
      </div>
    `;

    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.ADMIN_EMAIL,
            Name: "AlBirr Admin",
          },
          To: [
            {
              Email: admin.email,
              Name: admin.name,
            },
          ],
          Subject: "Admin Password Reset - AlBirr",
          TextPart: `Your admin password has been reset. Temporary password: ${tempPassword}. Login at: ${loginLink}`,
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
      { status: 500 }
    );
  }
}
