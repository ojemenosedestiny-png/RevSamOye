import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <main id="main" className="grain relative grid min-h-[100svh] place-items-center overflow-hidden px-5 text-center">
      <div className="light-rays absolute inset-0 -z-10" />
      <div>
        <p className="eyebrow justify-center">Page not found</p>
        <h1 className="mt-6 font-serif text-display-xl">
          4<span className="italic text-gold-gradient">0</span>4
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">The page you're looking for has moved or no longer exists.</p>
        <Link href="/" className="btn-primary mt-10">
          <Icon name="arrowLeft" className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </main>
  );
}
