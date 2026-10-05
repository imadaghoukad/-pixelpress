import type { Metadata } from "next";
import { ImageTool } from "@/components/image-tool";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return <ImageTool />;
}
