"use client";

import Link from "next/link";
import Image from "next/image";
import { Dancing_Script } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { formatPrice } from "@/lib/currency";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// AL-BIRR Brand Colors (from logo)
const brandColors = {
  magenta: "#E91E8C",
  orange: "#FF8C42",
  yellow: "#F7DC6F",
  teal: "#48C9B0",
  purple: "#9B59B6",
  coral: "#FF6B6B",
  // Light variants
  cream: "#FDF8F3",
  mintLight: "#E8F6F3",
  purpleLight: "#FAF5FF",
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    setMounted(true);
    fetchProducts();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 5, hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // At the top of your HomePage component, add this to the useEffect:
  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setFeaturedProducts(data.slice(0, 4));
      setNewArrivals(data.slice(0, 6));

      // Add this - Fetch testimonials
      const testimonialsRes = await fetch("/api/testimonials");
      const testimonialsData = await testimonialsRes.json();
      setTestimonials(testimonialsData.slice(0, 3)); // Get first 3 active testimonials
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div
        className="py-2.5 text-center text-white text-sm font-medium"
        style={{ backgroundColor: brandColors.coral }}
      >
        🎉 Free Shipping on Orders Above ₹999 | Pan India Delivery
      </div>

      {/* Countdown Timer Bar */}
      <div
        className="py-3 text-center"
        style={{ backgroundColor: brandColors.magenta }}
      >
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white">
          <span className="font-semibold">🌙 Ramadan Sale Ends In:</span>
          <div className="flex items-center gap-2 md:gap-3">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="bg-white text-gray-800 px-2 py-1 rounded font-bold text-sm min-w-[32px] text-center">
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-xs text-white/90 hidden sm:inline">
                  {item.label}
                </span>
                {i < 3 && <span className="text-white/50 ml-1 md:ml-2">:</span>}
              </div>
            ))}
          </div>
          <Link href="/products?sale=true">
            <Button
              size="sm"
              className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-4 font-semibold text-xs"
            >
              SHOP NOW
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Banner Slider */}
      <section className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            prevEl: ".hero-prev",
            nextEl: ".hero-next",
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="hero-swiper"
        >
          {/* Banner 1 - Ramadan Sale */}
          <SwiperSlide>
            <div
              className="relative min-h-[400px] md:min-h-[480px] flex items-center"
              style={{
                background: `linear-gradient(135deg, ${brandColors.mintLight} 0%, ${brandColors.cream} 100%)`,
              }}
            >
              <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Left side - Products showcase */}
                  <div className="relative h-[250px] md:h-[350px] flex items-center justify-center order-2 md:order-1">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Stacked book/product images */}
                      <motion.div
                        className="absolute w-28 h-36 md:w-32 md:h-44 bg-white rounded-lg shadow-lg transform -rotate-12 overflow-hidden"
                        style={{ left: "10%" }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center">
                          <span className="text-4xl">📚</span>
                        </div>
                      </motion.div>
                      <motion.div
                        className="absolute w-32 h-40 md:w-40 md:h-52 bg-white rounded-lg shadow-xl z-10 overflow-hidden"
                        style={{ left: "25%" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-teal-200 to-teal-300 flex items-center justify-center">
                          <span className="text-5xl">🕌</span>
                        </div>
                      </motion.div>
                      <motion.div
                        className="absolute w-28 h-36 md:w-32 md:h-44 bg-white rounded-lg shadow-lg transform rotate-12 overflow-hidden"
                        style={{ left: "45%" }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                          <span className="text-4xl">🌙</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Right side - Text content */}
                  <div className="text-center md:text-left order-1 md:order-2">
                    <motion.h1
                      className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2"
                      style={{ color: "#F4D03F" }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      RAMADAN
                    </motion.h1>
                    <motion.h1
                      className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
                      style={{ color: brandColors.orange }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      SALE
                    </motion.h1>
                    <motion.div
                      className="flex flex-col md:flex-row items-center gap-2 md:gap-4 justify-center md:justify-start mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="text-base md:text-lg text-gray-600 flex items-center gap-1">
                        <Star
                          className="w-4 h-4"
                          style={{ color: brandColors.yellow }}
                        />{" "}
                        SITE WIDE
                      </span>
                      <div className="text-center">
                        <span
                          className="text-5xl md:text-7xl font-bold"
                          style={{ color: "#F4D03F" }}
                        >
                          20%
                        </span>
                        <span className="block text-lg md:text-xl text-gray-500">
                          • • • OFF • • •
                        </span>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Link href="/products?sale=ramadan">
                        <Button
                          size="lg"
                          className="rounded-full px-8 font-semibold text-white"
                          style={{ backgroundColor: brandColors.magenta }}
                        >
                          Shop Ramadan Collection
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Decorative element on right */}
              <div className="hidden lg:flex absolute right-4 bottom-0 w-32 h-56 items-end justify-center">
                <div className="text-7xl">🧕</div>
              </div>
            </div>
          </SwiperSlide>

          {/* Banner 2 - Brand Introduction */}
          <SwiperSlide>
            <div
              className="relative min-h-[400px] md:min-h-[480px] flex items-center"
              style={{
                background: `linear-gradient(135deg, ${brandColors.purpleLight} 0%, ${brandColors.cream} 100%)`,
              }}
            >
              <div className="container mx-auto px-4 py-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2
                    className={`${dancingScript.className} text-5xl md:text-7xl lg:text-8xl mb-4`}
                  >
                    <span style={{ color: brandColors.teal }}>A</span>
                    <span style={{ color: brandColors.orange }}>L</span>
                    <span style={{ color: brandColors.magenta }}>-</span>
                    <span style={{ color: brandColors.yellow }}>B</span>
                    <span style={{ color: brandColors.purple }}>I</span>
                    <span style={{ color: brandColors.teal }}>R</span>
                    <span style={{ color: brandColors.magenta }}>R</span>
                  </h2>
                  <p
                    className="text-xl md:text-2xl lg:text-3xl mb-2 font-medium"
                    style={{ color: brandColors.purple }}
                  >
                    The Learning House
                  </p>
                  <p className="text-base md:text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                    Islamic Educational Products for Children - Flashcards,
                    Binders, Story Boxes & More
                  </p>
                  <Link href="/products">
                    <Button
                      size="lg"
                      className="rounded-full px-8 font-semibold text-white"
                      style={{ backgroundColor: brandColors.purple }}
                    >
                      Explore Collection
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Navigation Arrows */}
        <button className="hero-prev absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button className="hero-next absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </section>

      {/* Featured Section Title */}
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2"
            style={{ color: brandColors.purple }}
          >
            Ramadan Must-Haves
          </h2>
          <Link
            href="/products?collection=ramadan"
            className="text-sm font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
            style={{ color: brandColors.magenta }}
          >
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* Featured Products Slider */}
      <section className="pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="relative px-6 md:px-12">
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={1.5}
              navigation={{
                prevEl: ".products-prev",
                nextEl: ".products-next",
              }}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 16 },
                640: { slidesPerView: 2.5, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 24 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              className="products-swiper"
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} brandColors={brandColors} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Arrows */}
            <button className="products-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
            <button className="products-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Category Banners */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: "Arabic Flashcards",
                subtitle: "Learn Arabic Letters",
                icon: "📚",
                bg: brandColors.mintLight,
                color: brandColors.teal,
                link: "/products?category=flashcards",
              },
              {
                title: "Salah Binders",
                subtitle: "Prayer Guides for Kids",
                icon: "🕌",
                bg: brandColors.purpleLight,
                color: brandColors.purple,
                link: "/products?category=binders",
              },
              {
                title: "Prophet Stories",
                subtitle: "Story Box Collections",
                icon: "📖",
                bg: brandColors.cream,
                color: brandColors.orange,
                link: "/products?category=stories",
              },
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link href={cat.link}>
                  <Card
                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-0"
                    style={{ backgroundColor: cat.bg }}
                  >
                    <CardContent className="p-5 md:p-8 flex items-center justify-between">
                      <div>
                        <h3
                          className="text-lg md:text-xl font-bold mb-1"
                          style={{ color: cat.color }}
                        >
                          {cat.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{cat.subtitle}</p>
                        <span
                          className="inline-block mt-3 text-sm font-medium underline underline-offset-4"
                          style={{ color: cat.color }}
                        >
                          Shop Now →
                        </span>
                      </div>
                      <span className="text-4xl md:text-5xl">{cat.icon}</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2"
              style={{ color: brandColors.purple }}
            >
              New Arrivals
            </h2>
            <p className="text-gray-600">
              Fresh Islamic learning products for your little ones
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard
                  product={product}
                  brandColors={brandColors}
                  isNew
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-10">
            <Link href="/products">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 font-semibold border-2"
                style={{
                  borderColor: brandColors.purple,
                  color: brandColors.purple,
                }}
              >
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section
        className="py-10 md:py-12"
        style={{ backgroundColor: brandColors.cream }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[
              {
                icon: "🚚",
                title: "Free Shipping",
                subtitle: "On orders ₹999+",
              },
              {
                icon: "🛡️",
                title: "Safe & Quality",
                subtitle: "Certified products",
              },
              {
                icon: "💝",
                title: "Gift Wrapping",
                subtitle: "Available on request",
              },
              {
                icon: "💬",
                title: "24/7 Support",
                subtitle: "Always here to help",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <span className="text-3xl md:text-4xl mb-2 md:mb-3">
                  {item.icon}
                </span>
                <h4 className="font-semibold text-gray-800 text-sm md:text-base">
                  {item.title}
                </h4>
                <p className="text-xs md:text-sm text-gray-600">
                  {item.subtitle}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10"
            style={{ color: brandColors.purple }}
          >
            What Parents Say
          </h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border border-gray-100">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-current"
                          style={{ color: brandColors.yellow }}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic text-sm md:text-base">
                      "{review.text}"
                    </p>
                    <p className="font-semibold text-gray-800">{review.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {testimonials.length === 0 && (
            <p className="text-center text-gray-500">No testimonials yet</p>
          )}
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section
        className="py-12 md:py-16"
        style={{ backgroundColor: brandColors.magenta }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
            Join Our Family
          </h2>
          <p className="text-white/90 mb-6 md:mb-8 max-w-xl mx-auto text-sm md:text-base">
            Subscribe for updates on new products, exclusive offers, and Islamic
            parenting tips!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
            />
            <Button
              className="rounded-full px-6 font-semibold text-white"
              style={{ backgroundColor: brandColors.purple }}
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h3
            className="text-xl md:text-2xl font-bold mb-2"
            style={{ color: brandColors.purple }}
          >
            Follow Us @albirr
          </h3>
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            Tag us in your photos for a chance to be featured!
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl bg-gradient-to-br from-gray-50 to-gray-100">
                  📷
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Reviews Button */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <button
          className="text-white py-3 px-2 rounded-l-lg shadow-lg flex flex-col items-center gap-1 text-xs font-medium"
          style={{ backgroundColor: brandColors.teal }}
        >
          <Star className="w-4 h-4 fill-current" />
          <span style={{ writingMode: "vertical-rl" }}>Reviews</span>
        </button>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, brandColors, isNew = false }) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl">
        <div className="relative">
          {/* Sale Badge */}
          <div
            className="absolute top-4 right-4 md:top-5 md:right-5 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold z-10 shadow-sm"
            style={{ backgroundColor: brandColors.coral }}
          >
            On Sale
          </div>

          {/* Product Image */}
          <div className="relative aspect-square w-full bg-gray-50 overflow-hidden rounded-2xl m-2 md:m-3">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        <CardContent className="p-3 md:p-4 text-center">
          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 min-h-[40px] md:min-h-[48px] text-xs md:text-sm">
            {product.name}
          </h3>

          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            <span
              className="text-base md:text-lg font-bold"
              style={{ color: brandColors.magenta }}
            >
              {formatPrice(product.price * 0.8)}
            </span>
            <span className="text-xs md:text-sm line-through text-gray-400">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 fill-current"
                  style={{ color: brandColors.yellow }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">5 reviews</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
