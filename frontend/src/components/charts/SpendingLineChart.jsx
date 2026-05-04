// src/components/charts/SpendingLineChart.jsx
// Shows cumulative confirmed balance over time as a line chart.
// Only confirmed transactions affect balance, so we only plot those.

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

export default function SpendingLineChart({ transactions }) {
  // Only confirmed txns affect real balance
  const confirmed = transactions
    .filter(tx => tx.status === "confirmed")
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Build cumulative balance series
  let running = 0;
  const points = confirmed.map(tx => {
    if (tx.transaction_type === "deposit") running += parseFloat(tx.amount);
    if (tx.transaction_type === "withdrawal") running -= parseFloat(tx.amount);
    if (tx.transaction_type === "contribution") running -= parseFloat(tx.amount);
    return {
      date: new Date(tx.created_at).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }),
      balance: parseFloat(running.toFixed(2)),
    };
  });

  if (points.length === 0) {
    return <EmptyChart message="No confirmed transactions yet." />;
  }

  const data = {
    labels: points.map(p => p.date),
    datasets: [
      {
        label: "Balance (₱)",
        data: points.map(p => p.balance),
        fill: true,
        backgroundColor: "rgba(124, 58, 237, 0.10)",
        borderColor: "#7C3AED",
        borderWidth: 2.5,
        pointBackgroundColor: "#7C3AED",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
      <Line data={data} options={options} />
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="h-56 flex items-center justify-center text-sm text-gray-400">
      {message}
    </div>
  );
}
