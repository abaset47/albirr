import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata = {
  title: "Your Shop Name",
  description: "Quality products for everyone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
