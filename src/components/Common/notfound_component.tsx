import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const POPULAR = [
  { label: "Performance", to: "/daily-ads-status" },
  { label: "Advertisers", to: "/advertisers" },
  { label: "Points", to: "/points" },
  { label: "Notifications", to: "/notifications" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-6">
      <section className="flex w-full max-w-[520px] flex-col gap-4">
        <span className="font-mono text-[13px] font-medium text-primary">404</span>
        <h1 className="text-[30px] font-semibold tracking-tight">This page isn't here</h1>
        <p className="leading-relaxed text-muted-foreground">The link may be old, or the ad or advertiser it pointed to was removed. Try one of these instead.</p>
        <div className="flex flex-wrap gap-2.5">
          <Button asChild className="h-10 px-4"><Link to="/">Go to dashboard</Link></Button>
          <Button asChild variant="outline" className="h-10 bg-card px-4"><Link to="/ads">Find an ad</Link></Button>
        </div>
        <nav aria-label="Popular pages" className="mt-2 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
          {POPULAR.map((p) => (
            <Link key={p.to} to={p.to} className="rounded-[9px] border bg-card px-3 py-2.5 text-foreground/80 hover:border-input hover:text-foreground">
              {p.label}
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
