// src/components/charts/MonthlyBarChart.jsx
// Grouped bar chart: deposits vs withdrawals per month (last 6 months).

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Build last N month labels as "MMM YY"
function lastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString("en-PH", { month: "short", year: "2-digit" }));
  }
  return months;
}

export default function MonthlyBarChart({ transactions }) {
  const MONTHS = 6;
  const labels = lastNMonths(MONTHS);

  // Key format matching labels
  const toKey = date =>
    new Date(date).toLocaleDateString("en-PH", { month: "short", year: "2-digit" });

  const deposits = Object.fromEntries(labels.map(l => [l, 0]));
  const withdrawals = Object.fromEntries(labels.map(l => [l, 0]));

  transactions.forEach(tx => {
    const key = toKey(tx.created_at);
    if (!labels.includes(key)) return;
    if (tx.transaction_type === "deposit") {
      deposits[key] += parseFloat(tx.amount);
    } else if (
      tx.transaction_type === "withdrawal" ||
      tx.transaction_type === "contribution"
    ) {
      withdrawals[key] += parseFloat(tx.amount);
    }
  });

  const hasData =
    Object.values(deposits).some(v => v > 0) || Object.values(withdrawals).some(v => v > 0);

  if (!hasData) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-gray-400">
        No transactions in the last 6 months.
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Deposits",
        data: labels.map(l => parseFloat(deposits[l].toFixed(2))),
        backgroundColor: "#0D948888",
        borderColor: "#0D9488",
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Withdrawals",
        data: labels.map(l => parseFloat(withdrawals[l].toFixed(2))),
        backgroundColor: "#F43F5E88",
        borderColor: "#F43F5E",
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          font: { size: 12, weight: "600" },
          color: "#4B5563",
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: ctx =>
            ` ₱${ctx.parsed.y.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#9CA3AF" },
      },
      y: {
        grid: { color: "#F3F4F6" },
        ticks: {
          font: { size: 11 },
          color: "#9CA3AF",
          callback: v => `₱${v.toLocaleString("en-PH")}`,
        },
      },
    },
  };

  return (
    <div className="h-56">
      <Bar data={data} options={options} />
    </div>
  );
}
