"use client";

import { useState } from "react";
import { login } from "@/lib/api";
import { LoginResponse, TransactionRecord } from "@/types";

function getStatusColor(status: string): string {
  switch (status) {
    case "settlement":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    case "cancel":
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    case "timeout":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
    case "refund":
    case "refunded":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
    case "expire":
    case "create":
      return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
    default:
      return "bg-purple-500/15 text-purple-400 border border-purple-500/20";
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentMethod(record: TransactionRecord): string {
  return record.payment.method || "-";
}

function getIssuer(record: TransactionRecord): string {
  if (typeof record.payment.detail === "string") {
    return record.payment.detail;
  }
  return record.payment.detail?.issuer || "-";
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoginResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login({ username, password });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setData(null);
    setUsername("");
    setPassword("");
    setError(null);
  };

  const entries = data
    ? Object.entries(data.data).map(([id, record]) => ({ id, ...record }))
    : [];

  const filteredEntries =
    statusFilter === "all"
      ? entries
      : entries.filter((e) => e.detail.transaction_status === statusFilter);

  const statuses = data
    ? [...new Set(entries.map((e) => e.detail.transaction_status))]
    : [];

  const statusCounts = entries.reduce(
    (acc, e) => {
      const s = e.detail.transaction_status;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalAmount = entries
    .filter((e) => e.detail.transaction_status === "settlement")
    .reduce((sum, e) => sum + e.payment.amount, 0);

  const totalNett = entries
    .filter((e) => e.detail.transaction_status === "settlement")
    .reduce((sum, e) => sum + e.payment.nett, 0);

  // Login page
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Background gradient blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-700/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-700/10 blur-3xl" />
        </div>

        <div className="animate-fade-in relative w-full max-w-md">
          <div className="animate-pulse-glow rounded-2xl border border-card-border bg-card-bg p-8 shadow-2xl shadow-purple-900/10">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20">
                <svg
                  className="h-7 w-7 text-accent-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Iotera Vending
              </h1>
              <p className="mt-1 text-sm text-muted">
                Sign in to view transaction data
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter username"
                  className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-sm text-white placeholder-muted/60 transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-sm text-white placeholder-muted/60 transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard page after login
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-card-border bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
              <svg
                className="h-4 w-4 text-accent-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">
              Iotera Vending Dashboard
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-card-border bg-card-bg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-500/30 hover:text-red-400"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Success banner */}
        <div className="animate-fade-in mb-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <svg
                className="h-4 w-4 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-300">
                {data.message}
              </p>
              <p className="text-xs text-emerald-400/60">
                Loaded {entries.length} transactions
              </p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="animate-fade-in mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "0.1s" }}>
          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Total Transactions
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {entries.length}
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Settled Amount
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Net Revenue
            </p>
            <p className="mt-2 text-2xl font-bold text-accent-light">
              {formatCurrency(totalNett)}
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Settlement Rate
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {entries.length > 0
                ? (
                    (statusCounts["settlement"] || 0) /
                    entries.length *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="animate-fade-in mb-6 flex flex-wrap items-center gap-2" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === "all"
                ? "bg-accent text-white"
                : "border border-card-border bg-card-bg text-muted hover:text-white"
            }`}
          >
            All ({entries.length})
          </button>
          {statuses.sort().map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                statusFilter === status
                  ? "bg-accent text-white"
                  : "border border-card-border bg-card-bg text-muted hover:text-white"
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="animate-fade-in overflow-hidden rounded-xl border border-card-border bg-card-bg" style={{ animationDelay: "0.3s" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-card-border bg-surface/50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    #
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Product
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Nett
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Method
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Issuer
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => {
                  const productName =
                    entry.product.name ||
                    entry.product.items?.map((i) => i.name).join(", ") ||
                    "-";
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-card-border/50 transition-colors hover:bg-surface/30"
                    >
                      <td className="px-4 py-3 text-xs text-muted">
                        {index + 1}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-muted">
                        {entry.detail.order_id}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-white">
                        {productName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                        {formatCurrency(entry.payment.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-accent-light">
                        {formatCurrency(entry.payment.nett)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                        {getPaymentMethod(entry)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                        {getIssuer(entry)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(entry.detail.transaction_status)}`}
                        >
                          {entry.detail.transaction_status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                        {formatTimestamp(entry.time.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="p-12 text-center text-sm text-muted">
              No transactions found for the selected filter.
            </div>
          )}

          {/* Table footer */}
          <div className="border-t border-card-border bg-surface/30 px-4 py-3">
            <p className="text-xs text-muted">
              Showing {filteredEntries.length} of {entries.length} transactions
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
