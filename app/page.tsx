import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { homeStructuredData } from "@/lib/readerCopy";
import { publicSiteUrl } from "@/lib/site";
import Home from "./rankings-home";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={homeStructuredData(publicSiteUrl())} />
      <Home />
    </>
  );
}
