import React, { useState } from "react";

const BACKEND_URL = "https://kadhaipomaa-backend.onrender.com";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState({ activeConnections: 0, violations: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStats = async (pwd = password) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd })
      });
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      const data = await res.json();
      setStats(data);
      setAuthenticated(true);
      setError("");
    } catch (err) {
      setError("Invalid Password or Backend Error");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchStats();
  };

  const handleUnban = async (ip) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ip })
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!authenticated) {
    return (
      <div style={{ display: "flex", height: "100vh", backgroundColor: "#000", color: "#fff", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <input 
            type="password" 
            placeholder="Admin Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#111", color: "#fff" }}
          />
          <button type="submit" disabled={loading} style={{ padding: "0.5rem", backgroundColor: "#ff4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Login
          </button>
        </form>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
      <h2>Admin Dashboard</h2>
      <button onClick={() => fetchStats()} style={{ marginBottom: "1rem", padding: "0.5rem", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        Refresh Stats
      </button>
      <div style={{ marginBottom: "2rem" }}>
        <strong>Active WebSocket Connections:</strong> {stats.activeConnections}
      </div>

      <h3>Flagged IP Addresses</h3>
      <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #333" }}>
            <th style={{ padding: "0.5rem" }}>IP Address</th>
            <th style={{ padding: "0.5rem" }}>Strikes</th>
            <th style={{ padding: "0.5rem" }}>Banned Until</th>
            <th style={{ padding: "0.5rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stats.violations.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: "0.5rem", textAlign: "center", color: "#aaa" }}>No violations tracked.</td>
            </tr>
          ) : (
            stats.violations.map((v) => (
              <tr key={v.ip} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "0.5rem" }}>{v.ip}</td>
                <td style={{ padding: "0.5rem", color: v.count >= 3 ? "#ff4444" : "#ffaa00" }}>{v.count}</td>
                <td style={{ padding: "0.5rem" }}>
                  {v.bannedUntil ? new Date(v.bannedUntil).toLocaleString() : "Not banned"}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <button onClick={() => handleUnban(v.ip)} style={{ padding: "0.2rem 0.5rem", backgroundColor: "#44aa44", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Clear / Unban
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
