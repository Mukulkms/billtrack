import { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle,
  Store,
  Wallet,
  Loader2,
} from "lucide-react";
import { getDashboardStatsApi } from "../api/dashboard";
import { DashboardStats } from "../types";
import { fmtAmount, fmtDate, daysLeft } from "../utils/helpers";
import StatusPill from "../components/ui/StatusPill";
import ShopAvatar from "../components/ui/ShopAvatar";
import AIInsights from "../components/dashboard/AIInsights";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const AddBillModal = lazy(() => import("../components/modals/AddBillModal"));

const C = {
  ink: "#17140F",
  green: "#3F8F5F",
  amber: "#C2790C",
  accent: "#B4432E",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton" style={{ width: 90, height: 12 }} />
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 999 }} />
      </div>
      <div className="skeleton mb-2" style={{ width: 110, height: 26 }} />
      <div className="skeleton" style={{ width: 70, height: 10 }} />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddBill, setShowAddBill] = useState(false);

  useEffect(() => {
    getDashboardStatsApi()
      .then((data) => setStats(data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="skeleton" style={{ width: 160, height: 20 }} />
            <div className="skeleton" style={{ width: 200, height: 12 }} />
          </div>
          <div className="skeleton" style={{ width: 160, height: 32, borderRadius: 999 }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="skeleton" style={{ width: "100%", height: 220, borderRadius: 20 }} />
      </div>
    );
  }
  if (!stats) return null;

  const statCards = [
    {
      label: "Total outstanding",
      value: fmtAmount(stats.totalOutstanding),
      sub: `${stats.pendingCount} bills pending`,
      icon: <TrendingDown size={18} />,
      iconBg: "var(--color-primary-soft)",
      iconColor: C.ink,
      valueColor: "var(--color-text)",
    },
    {
      label: "Total collection",
      value: fmtAmount(stats.totalCollected),
      sub: `${stats.paidCount} bills paid`,
      icon: <TrendingUp size={18} />,
      iconBg: "var(--color-success-soft)",
      iconColor: C.green,
      valueColor: C.green,
    },
    {
      label: "Due this week",
      value: stats.weeklyDue.length,
      sub:
        fmtAmount(
          stats.weeklyDue.reduce((s, b) => s + Number(b.pendingAmount), 0),
        ) + " expected",
      icon: <Clock size={18} />,
      iconBg: "var(--color-warning-soft)",
      iconColor: C.amber,
      valueColor: C.amber,
    },
    {
      label: "Collected this month",
      value: fmtAmount(stats.collectedThisMonth),
      sub: `${stats.paidCount} total paid`,
      icon: <CheckCircle size={18} />,
      iconBg: "var(--color-success-soft)",
      iconColor: C.green,
      valueColor: C.green,
    },
  ];

  const totalBilled = stats.totalCollected + stats.totalOutstanding;
  const collectionRate = totalBilled > 0 ? (stats.totalCollected / totalBilled) * 100 : 0;

  const maxCategoryAmount = Math.max(1, ...(stats.categoryTotals?.map((c) => c.totalAmount) || [1]));

  return (
    <div className="p-4 md:p-6 space-y-5">
      {showAddBill && (
        <Suspense fallback={<div className="modal-overlay"><Loader2 className="animate-spin text-white" size={22} /></div>}>
          <AddBillModal
            onClose={() => {
              setShowAddBill(false);
              getDashboardStatsApi().then(setStats).catch(() => {});
            }}
          />
        </Suspense>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow mb-0.5">{greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to="/shops/new" className="btn btn-sm">
            <Store size={14} /> Add shop
          </Link>
          <button className="btn btn-sm btn-primary" onClick={() => setShowAddBill(true)}>
            + Add bill
          </button>
        </div>
      </div>

      {stats.overdueCount > 0 && (
        <div
          className="rounded-2xl p-3.5 flex items-center gap-3 flex-wrap"
          style={{ background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-border)" }}
        >
          <AlertTriangle size={16} style={{ color: "var(--color-danger)", flexShrink: 0 }} />
          <p className="text-sm flex-1" style={{ color: "#7C2E1E", minWidth: 0 }}>
            <span className="font-semibold">
              {stats.overdueCount} overdue bill{stats.overdueCount > 1 ? "s" : ""}
            </span>{" "}
            need immediate attention
          </p>
          <Link to="/bills?status=OVERDUE" className="btn btn-sm btn-danger flex-shrink-0">
            View overdue
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: s.iconBg, color: s.iconColor }}
              >
                {s.icon}
              </div>
            </div>
            <p className="text-[26px] font-bold leading-none mb-1" style={{ color: s.valueColor, fontVariantNumeric: "tabular-nums" }}>
              {s.value}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <AIInsights />

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Wallet size={15} style={{ color: C.ink }} />
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Receivables health</p>
          </div>
          <p className="text-sm font-bold" style={{ color: C.ink }}>{collectionRate.toFixed(0)}% collected</p>
        </div>
        <div className="health-track">
          <div className="health-fill" style={{ width: `${collectionRate}%`, background: `linear-gradient(90deg, ${C.green}, #5CA97C)` }} />
          <div className="health-fill" style={{ width: `${100 - collectionRate}%`, background: "var(--color-accent-soft)" }} />
        </div>
        <div className="flex items-center gap-4 mt-2.5 flex-wrap">
          <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: C.green }} /> {fmtAmount(stats.totalCollected)} collected
          </span>
          <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--color-accent)" }} /> {fmtAmount(stats.totalOutstanding)} outstanding
          </span>
          {stats.overdueCount > 0 && (
            <span className="text-xs flex items-center gap-1.5 font-medium" style={{ color: "var(--color-danger)" }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--color-danger)" }} /> {stats.overdueCount} overdue
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Recent bills</h2>
            <Link to="/bills" className="btn btn-sm">See all →</Link>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 480 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
                    <th className="th">Shop</th>
                    <th className="th">Amount</th>
                    <th className="th">Due date</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBills.map((b) => {
                    const dl = daysLeft(b.dueDate);
                    return (
                      <tr
                        key={b.id}
                        className="table-row-hover transition-colors"
                        style={{ borderBottom: "1px solid var(--color-border-soft)" }}
                      >
                        <td className="td">
                          <div className="flex items-center gap-2">
                            <ShopAvatar shop={b.shop as any} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate" style={{ color: "var(--color-text)" }}>{b.shop?.shopName}</p>
                              <p className="text-xs font-mono" style={{ color: "var(--color-text-faint)" }}>{b.billNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="td">
                          <span className="text-sm font-semibold" style={{ color: "var(--color-text)", fontVariantNumeric: "tabular-nums" }}>
                            {fmtAmount(b.pendingAmount)}
                          </span>
                        </td>
                        <td className="td">
                          <p className="text-xs" style={{ color: "var(--color-text-soft)" }}>{fmtDate(b.dueDate)}</p>
                          {b.status !== "PAID" && (
                            <p className="text-xs mt-0.5 font-medium" style={{ color: dl < 0 ? "var(--color-danger)" : dl <= 3 ? "var(--color-warning)" : "var(--color-text-faint)" }}>
                              {dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? "Today!" : `in ${dl}d`}
                            </p>
                          )}
                        </td>
                        <td className="td"><StatusPill status={b.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {stats.recentBills.length === 0 && (
              <div className="py-12 text-center text-sm" style={{ color: "var(--color-text-faint)" }}>
                No bills yet.{" "}
                <button onClick={() => setShowAddBill(true)} style={{ color: "var(--color-text)" }} className="font-medium underline">
                  Add your first bill →
                </button>
              </div>
            )}
          </div>
        </div>

        {stats.categoryTotals?.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Category-wise spend</h2>
            <div className="card p-4 space-y-3.5">
              {stats.categoryTotals.map((c) => (
                <div key={c.categoryId}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--color-text-soft)" }}>{c.categoryName}</p>
                    <p className="text-xs font-bold flex-shrink-0 ml-2" style={{ color: C.ink }}>{fmtAmount(c.totalAmount)}</p>
                  </div>
                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill"
                      style={{ width: `${(c.totalAmount / maxCategoryAmount) * 100}%`, background: "linear-gradient(90deg, #3A362E, #17140F)" }}
                    />
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: "var(--color-text-faint)" }}>{c.billCount} bill{c.billCount !== 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {stats.weeklyDue.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Due this week</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {stats.weeklyDue.slice(0, 6).map((b) => {
              const dl = daysLeft(b.dueDate);
              const urgent = dl === 0;
              const soon = dl <= 2 && dl > 0;
              const accent = urgent ? "var(--color-danger)" : soon ? "var(--color-warning)" : "var(--color-accent)";
              return (
                <Link
                  to={`/bills/${b.id}`}
                  key={b.id}
                  className="card p-3 flex items-center gap-3 transition-all"
                  style={{ borderLeft: `3px solid ${accent}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(23,20,15,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
                >
                  <ShopAvatar shop={b.shop as any} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--color-text)" }}>{b.shop?.shopName}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: "var(--color-text-soft)", fontVariantNumeric: "tabular-nums" }}>
                      {fmtAmount(b.pendingAmount)}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold flex-shrink-0 px-2 py-1 rounded-full"
                    style={{
                      background: urgent ? "var(--color-danger-soft)" : soon ? "var(--color-warning-soft)" : "var(--color-accent-soft)",
                      color: urgent ? "var(--color-danger)" : soon ? "var(--color-warning)" : "#8A5A09",
                    }}
                  >
                    {dl === 0 ? "Today!" : `${dl}d`}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
