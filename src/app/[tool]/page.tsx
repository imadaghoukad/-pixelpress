import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageTool } from "@/components/image-tool";
import { toolPages } from "@/lib/pages";
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(toolPages).map((tool) => ({ tool }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const page = toolPages[tool as keyof typeof toolPages];
  return page
    ? {
        title: page.title,
        description: page.description,
        alternates: { canonical: `/${tool}/` },
      }
    : {};
}
export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const page = toolPages[tool as keyof typeof toolPages];
  if (!page) notFound();
  return (
    <ImageTool
      initial={"initial" in page ? page.initial : "compress"}
      target={"target" in page ? page.target : undefined}
    />
  );
}
