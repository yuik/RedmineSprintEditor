import type { Metadata } from "next";
import "./globals.css";
import { RedmineConfigProvider } from "@/lib/RedmineConfigContext";

export const metadata: Metadata = {
  title: "Redmine Sprint Editor",
  description: "Manage Redmine tickets specialized for agile sprint",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <RedmineConfigProvider>
          <header className="bg-indigo-700 text-white shadow">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="font-bold text-lg tracking-tight">
                Redmine Sprint Editor
              </a>
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </RedmineConfigProvider>
      </body>
    </html>
  );
}
