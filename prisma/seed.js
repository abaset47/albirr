const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Premium Headphones",
      description: "High-quality wireless headphones",
      price: 99.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      category: "Audio",
      stock: 15,
      features: [
        "Wireless Bluetooth 5.0",
        "Active Noise Cancellation",
        "30-hour battery",
        "Premium comfort padding",
      ],
      details:
        "Experience premium sound quality with our wireless headphones featuring active noise cancellation.",
      inStock: true,
    },
    {
      name: "Smart Watch",
      description: "Track your fitness in style",
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      category: "Wearables",
      stock: 8,
      features: [
        "Heart rate monitor",
        "Sleep tracking",
        "GPS built-in",
        "Water resistant",
      ],
      details:
        "Stay connected and track your health with our advanced smartwatch.",
      inStock: true,
    },
    {
      name: "Laptop Stand",
      description: "Ergonomic aluminum stand",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
      category: "Accessories",
      stock: 25,
      features: [
        "Aluminum construction",
        "Adjustable height",
        "Foldable design",
      ],
      details:
        "Improve your posture and workspace with our premium aluminum laptop stand.",
      inStock: true,
    },
    {
      name: "Wireless Mouse",
      description: "Precision wireless mouse",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
      category: "Accessories",
      stock: 30,
      features: ["2.4GHz wireless", "Ergonomic design", "6-month battery life"],
      details:
        "Work efficiently with our ergonomic wireless mouse featuring precise tracking.",
      inStock: true,
    },
    {
      name: "USB-C Hub",
      description: "Multi-port connectivity hub",
      price: 39.99,
      image:
        "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
      category: "Accessories",
      stock: 20,
      features: ["7 ports total", "HDMI 4K output", "USB 3.0 x3"],
      details: "Expand your connectivity with our 7-in-1 USB-C hub.",
      inStock: true,
    },
    {
      name: "Phone Case",
      description: "Protective silicone case",
      price: 19.99,
      image:
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500",
      category: "Accessories",
      stock: 50,
      features: [
        "Military-grade protection",
        "Slim profile",
        "Wireless charging compatible",
      ],
      details: "Protect your phone with our premium silicone case.",
      inStock: true,
    },
    {
      name: "Bluetooth Speaker",
      description: "Portable waterproof speaker",
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
      category: "Audio",
      stock: 12,
      features: ["Waterproof IPX7", "360° sound", "12-hour battery"],
      details: "Take your music anywhere with our portable waterproof speaker.",
      inStock: true,
    },
    {
      name: "Wireless Earbuds",
      description: "True wireless with ANC",
      price: 149.99,
      image:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
      category: "Audio",
      stock: 10,
      features: [
        "Active Noise Cancellation",
        "Touch controls",
        "24-hour battery with case",
      ],
      details: "Experience true wireless freedom with our premium earbuds.",
      inStock: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
