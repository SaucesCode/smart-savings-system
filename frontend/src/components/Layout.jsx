// src/components/Layout.jsx
// Wraps all authenticated pages.
// Sidebar is fixed on the left; the page content scrolls on the right.
// Usage in App.jsx:
//   <Route element={<Layout />}>
//     <Route path="/dashboard" element={<Dashboard />} />
//     <Route path="/wallet"    element={<WalletPage />} />
//     ...
//   </Route>

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#F8F7FF] font-sans">
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 ml-60 min-h-screen overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
