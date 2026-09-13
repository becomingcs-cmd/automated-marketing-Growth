"use client";

import {
  ArrowsClockwise,
  Brain,
  ChartLineUp,
  CheckCircle,
  GearSix,
  House,
  Megaphone,
  UsersThree,
  X,
  List,
  ShieldCheck,
} from "@phosphor-icons/react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import type { Role } from "@/domain/access";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/intelligence", label: "Intelligence", icon: Brain },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/approvals", label: "Approvals", icon: CheckCircle, badge: "3" },
  { href: "/dashboard/leads", label: "Leads & CRM", icon: UsersThree },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartLineUp },
];

export function AppShell({ children, userName, role }: { children: React.ReactNode; userName: string; role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const initials = userName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-head">
          <BrandMark />
          <button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-logo">B</div>
          <div><strong>BidNivo</strong><span>Pilot workspace</span></div>
          <ArrowsClockwise aria-hidden="true" />
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <span className="nav-label">Growth engine</span>
          {navigation.map(({ href, label, icon: Icon, badge }) => {
            const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={active ? "active" : ""} onClick={() => setOpen(false)}>
                <Icon weight={active ? "fill" : "regular"} /><span>{label}</span>{badge && <em>{badge}</em>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="safe-mode-card"><ShieldCheck weight="fill" /><div><strong>Safe mode is on</strong><span>External actions blocked</span></div></div>
          <Link href="/dashboard/settings"><GearSix /><span>Settings</span></Link>
          <div className="user-chip"><div>{initials}</div><span><strong>{userName}</strong><small>Workspace {role}</small></span></div>
        </div>
      </aside>
      {open && <button className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <div className="main-frame">
        <header className="mobile-header">
          <button className="icon-button" aria-label="Open menu" onClick={() => setOpen(true)}><List /></button>
          <BrandMark />
          {clerkEnabled ? <UserButton /> : <div className="avatar">{initials}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}
