const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Hash the password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create admin user
  const admin = await prisma.admin.upsert({
    where: { email: "admin@shop.com" },
    update: {},
    create: {
      email: "admin@shop.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });

  console.log("✅ Admin user created:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
