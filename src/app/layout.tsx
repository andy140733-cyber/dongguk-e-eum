import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "동국e음 (Dongguk e-eum) | 동국대학교 교육학과 종합 소통 플랫폼",
  description:
    "동국대학교 교육학과 재학생, 졸업생, 교수진을 위한 폐쇄형 학과 종합 소통·진로·학업 플랫폼 (프로토타입)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
