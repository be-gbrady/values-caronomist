import type { Metadata } from "next";
import Home from "./rankings-home";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
  verification: {
    google: "UmK-6qp6RuEo2vKYZQ--cG_irbuh1iIph2ElV58M4VQ",
  },
};

export default function Page() {
  return <Home />;
}
