"use client";

import { UserButton } from "@clerk/nextjs";
import { MobileNav } from "./mobile-nav";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
      <MobileNav />
      <div className="ml-auto">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
