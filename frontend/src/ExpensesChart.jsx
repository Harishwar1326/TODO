import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

function monthKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toISOString().slice(0, 7); // YYYY-MM
}

const COLOR_PALETTE = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#6b7280",
  "#ef7ab3",
  "#60a5fa",
];

export default function ExpensesChart({ expenses = [] }) {
  const [view, setView] = useState("category"); // 'category' | 'monthly'

  const { totalsByCategory, monthlyTotals, currency, totalAmount } = useMemo(() => {
    const tbc = {};
    const mt = {};
    let curCurrency = "USD";
    for (const e of expenses) {
      const cat = e.category || "Other";
      const amt = Number(e.amount || 0);
      tbc[cat] = (tbc[cat] || 0) + amt;

      const mk = monthKey(e.date);
      mt[mk] = (mt[mk] || 0) + amt;

      if (e.currency) curCurrency = e.currency;
    }

    const total = Object.values(tbc).reduce((s, v) => s + v, 0);

    return { totalsByCategory: tbc, monthlyTotals: mt, currency: curCurrency, totalAmount: total };
  }, [expenses]);

  // Normalize currency similar to App.formatCurrency
  function normalizeCurrency(code) {
    const symbolMap = { "$": "USD", "€": "EUR", "£": "GBP", "₹": "INR" };
    let c = code || "USD";
    if (typeof c === "string") {
      c = c.trim();
      if (symbolMap[c]) c = symbolMap[c];
      c = c.toUpperCase();
    } else {
      c = "USD";
    }
    if (!/^[A-Z]{3}$/.test(c)) c = "USD";
    return c;
  }

  const currencyCode = normalizeCurrency(currency);

  const categoryLabels = Object.keys(totalsByCategory);
  const categoryData = categoryLabels.map((l) => totalsByCategory[l]);

  const monthLabels = Object.keys(monthlyTotals).sort();
  const monthData = monthLabels.map((m) => monthlyTotals[m]);

  const pieData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryData,
        backgroundColor: categoryLabels.map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length]),
      },
    ],
  };

  const barData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "Amount",
        data: categoryData,
        backgroundColor: categoryLabels.map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length]),
      },
    ],
  };

  const lineData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Total",
        data: monthData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.raw || 0;
            try {
              return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(val);
            } catch (e) {
              return String(val);
            }
          },
        },
      },
      title: { display: true, text: view === "category" ? "Expenses by Category" : "Monthly Expense Trend" },
    },
  };

  return (
    <div className="card">
      <h2>Expenses Overview</h2>
      {expenses.length === 0 ? (
        <p>No data to visualize.</p>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setView("category")} disabled={view === "category"}>
              By Category
            </button>
            <button onClick={() => setView("monthly")} disabled={view === "monthly"}>
              Monthly Trend
            </button>
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            {view === "category" ? (
              <>
                <div style={{ width: 360, minWidth: 260 }}>
                  <div style={{ height: 260 }}>
                    <Pie data={pieData} options={commonOptions} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <h3>
                    Total: {(() => {
                      try {
                        return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(totalAmount);
                      } catch (e) {
                        return String(totalAmount);
                      }
                    })()}
                  </h3>
                  <div style={{ height: 260 }}>
                    <Bar data={barData} options={commonOptions} />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ width: "100%", minHeight: 320 }}>
                <Line data={lineData} options={commonOptions} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
