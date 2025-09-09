"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Adds two entries: Contacts Dashboard (/contacts) + Auto-send Cards & Gifts (/autosend)
type NavItem = { href: string; label: string };

const BASE_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/generator", label: "Card Maker" },
  { href: "/automation", label: "Send Gifts Automatically" },
  { href: "/party-planner", label: "Party Planner" },
  { href: "/gift-guide", label: "Personalized Gifts" },
  { href: "/showcase", label: "Showcase" },
];

const EXTRA_ITEMS: NavItem[] = [
  { href: "/contacts", label: "Contacts Dashboard" },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={[
        "px-3 py-2 rounded-md text-sm",
        active ? "font-semibold underline" : "text-muted-foreground hover:underline",
      ].join(" ")}
    >
      {item.label}
    </Link>
  );
}

export default function Navigation() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const items = [...BASE_ITEMS, ...EXTRA_ITEMS];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="text-base font-bold">BirthdayGen</Link>
        <button
          className="sm:hidden border rounded-md px-2 py-1 text-sm"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
        <div className="hidden sm:flex gap-1">
          {items.map((it) => (
            <NavLink key={it.href} item={it} active={isActive(it.href)} />
          ))}
        </div>
      </div>
      {open && (
        <div id="primary-nav" className="sm:hidden border-t px-4 py-2 flex flex-col gap-1">
          {items.map((it) => (
            <NavLink key={it.href} item={it} active={isActive(it.href)} />
          ))}
        </div>
      )}
    </nav>
  );
}
