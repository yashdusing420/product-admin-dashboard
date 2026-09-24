import { DashboardShell, ProtectedRoute } from "@/components/ui";

export default function ProductsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ProtectedRoute><DashboardShell>{children}</DashboardShell></ProtectedRoute>;
}