import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container not-found">
      <span className="eyebrow" style={{ justifyContent: "center" }}>
        404 / CONNECTION NOT FOUND
      </span>
      <h1>This route ends here.</h1>
      <p>
        This page isn’t at the other end. Let’s get you back to a working
        connection.
      </p>
      <Link href="/" className="button primary">
        <ArrowLeft size={16} />
        Back to DockRouter
      </Link>
      <Link href="/docs/getting-started/" className="button secondary">
        Find the docs
        <ArrowRight size={16} />
      </Link>
    </main>
  );
}
