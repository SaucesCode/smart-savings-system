// src/components/charts/TypeDoughnutChart.jsx
// Doughnut chart breaking down transactions by type (all statuses).

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const TYPE_LABELS = {
  deposit: "Deposits",
  withdrawal: "Withdrawals",
  contribution: "Contributions",
};

const TYPE_COLORS = {
  deposit: "#0D9488", // teal
  withdrawal: "#F43F5E", // coral
  contribution: "#7C3AED", // violet
};

export default function TypeDoughnutChart({ transactions }) {
  // Aggregate total amount per type
  const totals = transactions.reduce((acc, tx) => {
    acc[tx.transaction_type] = (acc[tx.transaction_type] || 0) + parseFloat(tx.amount);
    return acc;
  }, {});

  const types = Object.keys(totals);
  const values = types.map(t => parseFloat(totals[t].toFixed(2)));

  if (types.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-gray-400">
        No transactions yet.
      </div>
    );
  }

  const data = {
    labels: types.map(t => TYPE_LABELS[t] ?? t),
    datasets: [
      {
        data,
        backgroundColor: types.map(t => TYPE_COLORS[t] ?? "#9CA3AF"),
        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  // Swap data reference to values (not data object)
  data.datasets[0].data = values;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 12, weight: "600" },
          color: "#4B5563",
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: ctx =>
            ` ₱${ctx.parsed.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
        },
      },
    },
  };

  return (
    <div className="h-56 flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
}
