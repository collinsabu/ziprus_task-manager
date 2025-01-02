import { AuthProvider } from "./Providers";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import "@/app/globals.css";
import Footer from "@/components/footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure this is imported

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto mt-6">
            {children}
            {/* Toast Container for Notifications */}
            <ToastContainer position="top-right" autoClose={5000} />
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}