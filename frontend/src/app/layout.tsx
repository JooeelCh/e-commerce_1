import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "E-Commerce App",
  description: "Tienda Online Generica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} E-Commerce App. Todos los derechos reservados.
          <p>Hecho con Next.js, Supabase y Stripe</p>
        </footer>
      </body>
    </html>
  );
}
