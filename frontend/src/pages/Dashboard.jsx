import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 16px" }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
