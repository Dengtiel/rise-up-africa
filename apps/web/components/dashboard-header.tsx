"use client";

import Link from "next/link";
import React from "react";

interface Props {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: Props) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">Home</Link>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">Dashboard</Link>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
