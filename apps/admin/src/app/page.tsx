import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLayout } from "@/components/AdminLayout";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-zinc-400 mt-2">
          Welcome back, {session.name ?? session.email}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard title="Total Posts" value="—" />
          <AnalyticsCard title="Drafts" value="—" />
          <AnalyticsCard title="Pending Approval" value="—" />
          <AnalyticsCard title="Views (7d)" value="—" />
        </div>
        <p className="mt-6 text-zinc-500 text-sm">
          Analytics placeholder — integrate with your analytics provider.
        </p>
      </div>
    </AdminLayout>
  );
}

function AnalyticsCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
