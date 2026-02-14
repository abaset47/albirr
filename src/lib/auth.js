import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // Credentials Provider (handles both Admin and Customer)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" }, // "admin" or "customer"
      },
      async authorize(credentials) {
        try {
          const { email, password, loginType } = credentials;

          // Admin Login
          if (loginType === "admin") {
            const admin = await prisma.admin.findUnique({
              where: { email },
            });

            if (!admin) {
              return null;
            }

            const isValidPassword = await bcrypt.compare(
              password,
              admin.password,
            );
            if (!isValidPassword) {
              return null;
            }

            return {
              id: admin.id.toString(),
              email: admin.email,
              name: admin.name,
              role: "admin",
            };
          }

          // Customer Login
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            return null; // User doesn't exist or signed up with OAuth
          }

          if (!user.isActive) {
            throw new Error("Account is deactivated");
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: "customer",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            // User exists - check if active
            if (!existingUser.isActive) {
              return false; // Block deactivated users
            }
            // Update user info from Google if needed
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
              },
            });
          } else {
            // Create new user from Google OAuth
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "User",
                image: user.image,
                password: null, // OAuth users don't have password
                isActive: true,
              },
            });
          }
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role || "customer";
        token.id = user.id;
      }

      // For Google OAuth users, fetch user ID from database
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id.toString();
          token.role = "customer";
        }
      }

      // Handle session updates (e.g., after profile update)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "customer/login", // Default sign-in page for customers
    error: "customer/login", // Error page
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
