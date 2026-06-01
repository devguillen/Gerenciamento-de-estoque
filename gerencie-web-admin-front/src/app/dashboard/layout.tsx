// src/app/dashboard/layout.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardClientLayout from "./client-layout";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return <DashboardClientLayout user={user}>{children}</DashboardClientLayout>;
}
