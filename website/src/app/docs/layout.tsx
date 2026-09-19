import DocsSidebar from "@/components/DocsSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to use BeyondAgtest to scan, test, and monitor your mobile apps.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto flex gap-12">
        <DocsSidebar />
        <div className="flex-1 min-w-0 max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
