import type { Metadata } from "next";
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
  return <Home />;
}
