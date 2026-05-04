// src/components/charts/GoalProgressChart.jsx
// Horizontal bar chart showing progress toward savings goals.
// Includes the personal wallet goal + each group goal.

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Goal item shape: { label, current, goal }
export default function GoalProgressChart({ wallet, groups }) {
  const items = [];

  // Personal wallet goal
  if (wallet?.savings_goal && parseFloat(wallet.savings_goal) > 0) {
    items.push({
      label: "My Wallet",
      current: parseFloat(wallet.balance),
      goal: parseFloat(wallet.savings_goal),
    });
  }

  // Group goals
  groups.forEach(g => {
    if (g.goal_amount && parseFloat(g.goal_amount) > 0) {
      items.push({
        label: g.name.length > 18 ? g.name.slice(0, 18) + "…" : g.name,
        current: parseFloat(g.current_balance),
        goal: parseFloat(g.goal_amount),
      });
    }
  });

  if (items.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-gray-400">
        No savings goals set yet.
      </div>
    );
  }

  // Each bar is capped at 100% of goal
  const percentages = items.map(i =>
    parseFloat(Math.min((i.current / i.goal) * 100, 100).toFixed(1)),
  );

  const COLORS = ["#7C3AED", "#0D9488", "#F43F5E", "#F59E0B", "#6366F1"];

  const data = {
    labels: items.map(i => i.label),
    datasets: [
      {
        label: "Progress (%)",
        data: percentages,
        backgroundColor: items.map((_, idx) => COLORS[idx % COLORS.length] + "CC"),
        borderColor: items.map((_, idx) => COLORS[idx % COLORS.length]),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: "y", // horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const item = items[ctx.dataIndex];
            return [
              ` ${ctx.parsed.x}% of goal`,
              ` ₱${item.current.toLocaleString("en-PH", { minimumFractionDigits: 2 })} / ₱${item.goal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: "#F3F4F6" },
        ticks: {
          font: { size: 11 },
          color: "#9CA3AF",
          callback: v => `${v}%`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: "600" }, color: "#4B5563" },
      },
    },
  };

  // Dynamic height — 60px per bar, min 180px
  const chartHeight = Math.max(180, items.length * 60);

  return (
    <div style={{ height: chartHeight }}>
      <Bar data={data} options={options} />
    </div>
  );
}
