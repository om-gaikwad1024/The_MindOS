"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatCurrency, CHART_COLORS } from "@/lib/utils";
import { format } from "date-fns";
import type { Transaction, Account, FinanceCategory } from "@/types";

type Tab = "overview" | "transactions" | "budget" | "charts";

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [summary, setSummary] = useState<{
    income: number;
    expense: number;
    byCategory: Array<{ name: string; amount: number; color: string; icon: string }>;
  } | null>(null);
  const [monthlyData, setMonthlyData] = useState<
    Array<{ month: string; income: number; expense: number }>
  >([]);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTx, setNewTx] = useState({
    title: "",
    amount: "",
    type: "expense",
    categoryId: "",
    accountId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "card",
    balance: "",
    currency: "INR",
  });
  const [newCat, setNewCat] = useState({
    name: "",
    type: "expense",
    icon: "💳",
    monthlyBudget: "",
  });

  const load = async () => {
    const [accs, txs, cats, sum] = await Promise.all([
      fetch("/api/finance/accounts").then((r) => r.json()),
      fetch("/api/finance/transactions?limit=50").then((r) => r.json()),
      fetch("/api/finance/categories").then((r) => r.json()),
      fetch(
        `/api/finance/summary?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`
      ).then((r) => r.json()),
    ]);
    setAccounts(Array.isArray(accs) ? accs : []);
    setTransactions(Array.isArray(txs) ? txs : []);
    setCategories(Array.isArray(cats) ? cats : []);
    setSummary(sum);

    const monthly = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const m = new Date(
          new Date().getFullYear(),
          new Date().getMonth() - (5 - i),
          1
        );
        return fetch(
          `/api/finance/summary?month=${m.getMonth() + 1}&year=${m.getFullYear()}`
        )
          .then((r) => r.json())
          .then((d) => ({
            month: format(m, "MMM"),
            income: d.income || 0,
            expense: d.expense || 0,
          }));
      })
    );
    setMonthlyData(monthly);
  };

  useEffect(() => { load(); }, []);

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.accountId) return alert("Please select an account");
    setSaving(true);
    const res = await fetch("/api/finance/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newTx,
        amount: parseFloat(newTx.amount),
        categoryId: newTx.categoryId || null,
        tags: [],
      }),
    });
    if (!res.ok) {
      setSaving(false);
      return;
    }
    setSaving(false);
    setAddTxOpen(false);
    setNewTx({
      title: "",
      amount: "",
      type: "expense",
      categoryId: "",
      accountId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    });
    load();
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/finance/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newAccount,
        balance: parseFloat(newAccount.balance) || 0,
      }),
    });
    setSaving(false);
    setAddAccountOpen(false);
    setNewAccount({ name: "", type: "card", balance: "", currency: "INR" });
    load();
  };

  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/finance/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newCat,
        monthlyBudget: newCat.monthlyBudget ? parseFloat(newCat.monthlyBudget) : null,
        color: "#79c14a",
      }),
    });
    setSaving(false);
    setAddCatOpen(false);
    setNewCat({ name: "", type: "expense", icon: "💳", monthlyBudget: "" });
    load();
  };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const inputClass =
    "w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm text-[#ededed] placeholder-[#444] outline-none focus:border-[#333]";
  const tabClass = (t: Tab) =>
    `text-sm px-4 py-2 rounded-lg transition-all ${
      tab === t
        ? "bg-[#1a1a1a] text-[#ededed] font-medium"
        : "text-[#666] hover:text-[#999]"
    }`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#ededed]">Finance</h1>
          <p className="text-sm text-[#666] mt-1">Expense tracker & budget</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAddAccountOpen(true)}
            className="flex items-center gap-2 border border-[#1f1f1f] text-[#666] hover:text-[#ededed] hover:border-[#2a2a2a] text-sm px-3 py-2 rounded-lg transition-all"
          >
            <Plus size={13} /> Account
          </button>
          <button
            onClick={() => setAddCatOpen(true)}
            className="flex items-center gap-2 border border-[#1f1f1f] text-[#666] hover:text-[#ededed] hover:border-[#2a2a2a] text-sm px-3 py-2 rounded-lg transition-all"
          >
            <Plus size={13} /> Category
          </button>
          <button
            onClick={() => setAddTxOpen(true)}
            className="flex items-center gap-2 bg-accent text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent/90"
          >
            <Plus size={15} /> Transaction
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-[#111111] border border-[#1f1f1f] rounded-xl p-1 mb-6 w-fit">
        {(["overview", "transactions", "budget", "charts"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tabClass(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={14} className="text-[#666]" />
                <span className="text-xs text-[#666] uppercase tracking-wider">Total Balance</span>
              </div>
              <p className="text-2xl font-bold text-[#ededed]">
                {formatCurrency(totalBalance)}
              </p>
              <div className="mt-3 space-y-1">
                {accounts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#666]">{a.name}</span>
                    <span className="text-[#ededed]">{formatCurrency(a.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-accent" />
                <span className="text-xs text-[#666] uppercase tracking-wider">Income This Month</span>
              </div>
              <p className="text-2xl font-bold text-accent">
                {formatCurrency(summary?.income || 0)}
              </p>
            </div>
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={14} className="text-danger" />
                <span className="text-xs text-[#666] uppercase tracking-wider">Spent This Month</span>
              </div>
              <p className="text-2xl font-bold text-danger">
                {formatCurrency(summary?.expense || 0)}
              </p>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#ededed] mb-4">
              Recent Transactions
            </h2>
            {transactions.slice(0, 8).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 border-b border-[#1f1f1f] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tx.category?.icon || "💳"}</span>
                  <div>
                    <p className="text-sm text-[#ededed]">{tx.title}</p>
                    <p className="text-xs text-[#666]">
                      {format(new Date(tx.date), "MMM d")} ·{" "}
                      {tx.category?.name || "Uncategorized"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.type === "income" ? "text-accent" : "text-danger"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-sm text-[#666] text-center py-8">
                No transactions yet.
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "transactions" && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1f1f1f]">
            <p className="text-sm font-medium text-[#ededed]">
              {transactions.length} transactions
            </p>
          </div>
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f] last:border-0 hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{tx.category?.icon || "💳"}</span>
                <div>
                  <p className="text-sm text-[#ededed]">{tx.title}</p>
                  <p className="text-xs text-[#666]">
                    {format(new Date(tx.date), "MMM d, yyyy")} · {tx.account?.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    tx.type === "income" ? "text-accent" : "text-danger"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-[#666]">{tx.category?.name}</p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-sm text-[#666] text-center py-12">
              No transactions yet.
            </p>
          )}
        </div>
      )}

      {tab === "budget" && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">
            Budget Status — {format(new Date(), "MMMM yyyy")}
          </h2>
          {categories.filter((c) => c.type === "expense" && c.monthlyBudget).length === 0 && (
            <p className="text-sm text-[#666] text-center py-8">
              No budget categories yet. Add a category with a monthly budget.
            </p>
          )}
          {categories
            .filter((c) => c.type === "expense" && c.monthlyBudget)
            .map((cat) => {
              const spent =
                summary?.byCategory?.find((b) => b.name === cat.name)?.amount || 0;
              const pct = Math.min(100, (spent / (cat.monthlyBudget || 1)) * 100);
              const over = pct >= 100;
              return (
                <div key={cat.id} className="mb-5 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-sm text-[#ededed]">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-medium ${
                          over ? "text-danger" : "text-[#ededed]"
                        }`}
                      >
                        {formatCurrency(spent)}
                      </span>
                      <span className="text-xs text-[#666]">
                        {" "}/ {formatCurrency(cat.monthlyBudget || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: over ? "#e05252" : "#79c14a",
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#666] mt-1">
                    {over
                      ? `${formatCurrency(spent - (cat.monthlyBudget || 0))} over budget`
                      : `${formatCurrency((cat.monthlyBudget || 0) - spent)} remaining`}
                  </p>
                </div>
              );
            })}
        </div>
      )}

      {tab === "charts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#ededed] mb-4">
              Income vs Expense (6 months)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#666" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#111111",
                    border: "1px solid #1f1f1f",
                    borderRadius: "8px",
                    color: "#ededed",
                  }}
                />
                <Bar dataKey="income" fill="#79c14a" radius={4} name="Income" />
                <Bar dataKey="expense" fill="#e05252" radius={4} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#ededed] mb-4">
              Spending by Category
            </h2>
            {summary?.byCategory && summary.byCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={summary.byCategory}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                    >
                      {summary.byCategory.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#111111",
                        border: "1px solid #1f1f1f",
                        borderRadius: "8px",
                        color: "#ededed",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {summary.byCategory.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-xs text-[#666]">{c.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#666] text-center py-12">No data.</p>
            )}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal open={addTxOpen} onClose={() => setAddTxOpen(false)} title="Add Transaction">
        <form onSubmit={handleAddTx} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Title</label>
            <input
              value={newTx.title}
              onChange={(e) => setNewTx({ ...newTx, title: e.target.value })}
              className={inputClass}
              placeholder="Team lunch"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Amount (₹)</label>
              <input
                type="number"
                value={newTx.amount}
                onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                className={inputClass}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Type</label>
              <select
                value={newTx.type}
                onChange={(e) => setNewTx({ ...newTx, type: e.target.value, categoryId: "" })}
                className={inputClass}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Category</label>
              <select
                value={newTx.categoryId}
                onChange={(e) => setNewTx({ ...newTx, categoryId: e.target.value })}
                className={inputClass}
              >
                <option value="">None</option>
                {categories
                  .filter((c) => c.type === newTx.type)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Account</label>
              <select
                value={newTx.accountId}
                onChange={(e) => setNewTx({ ...newTx, accountId: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Date</label>
            <input
              type="date"
              value={newTx.date}
              onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Notes (optional)</label>
            <input
              value={newTx.notes}
              onChange={(e) => setNewTx({ ...newTx, notes: e.target.value })}
              className={inputClass}
              placeholder="Any notes..."
            />
          </div>
          {accounts.length === 0 && (
            <p className="text-xs text-amber-500 bg-amber-500/10 rounded-lg p-3">
              No accounts found. Add an account first.
            </p>
          )}
          <button
            type="submit"
            disabled={saving || accounts.length === 0}
            className="bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Transaction"}
          </button>
        </form>
      </Modal>

      {/* Add Account Modal */}
      <Modal
        open={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        title="Add Account"
      >
        <form onSubmit={handleAddAccount} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Account Name</label>
            <input
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              className={inputClass}
              placeholder="HDFC Savings"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Type</label>
              <select
                value={newAccount.type}
                onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                className={inputClass}
              >
                {["cash", "card", "savings", "investment"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Starting Balance (₹)</label>
              <input
                type="number"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                className={inputClass}
                placeholder="0"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Account"}
          </button>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        open={addCatOpen}
        onClose={() => setAddCatOpen(false)}
        title="Add Category"
      >
        <form onSubmit={handleAddCat} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Name</label>
              <input
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                className={inputClass}
                placeholder="Food & Dining"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Icon (emoji)</label>
              <input
                value={newCat.icon}
                onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                className={inputClass}
                placeholder="🍕"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Type</label>
              <select
                value={newCat.type}
                onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}
                className={inputClass}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">
                Monthly Budget (₹)
              </label>
              <input
                type="number"
                value={newCat.monthlyBudget}
                onChange={(e) => setNewCat({ ...newCat, monthlyBudget: e.target.value })}
                className={inputClass}
                placeholder="5000"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Category"}
          </button>
        </form>
      </Modal>
    </div>
  );
}