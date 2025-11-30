import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "HujesisAI - AI Image Generation",
  description:
    "Generate stunning AI images with powerful prompts. Create, save, and organize your AI-generated artwork.",
  keywords: [
    "AI",
    "image generation",
    "prompts",
    "artificial intelligence",
    "art",
  ],
  authors: [{ name: "HujesisAI Team" }],
  openGraph: {
    title: "HujesisAI - AI Image Generation",
    description: "Generate stunning AI images with powerful prompts",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
