import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getAdminComplaints,
  updateComplaintStatus,
  deleteComplaint,
} from "../api";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved", "Rejected"];

const STATUS_COLORS = {
  Pending: { bg: "#fef3c7", text: "#92400e" },
  "In Progress": { bg: "#dbeafe", text: "#1e40af" },
  Resolved: { bg: "#dcfce7", text: "#166534" },
  Rejected: { bg: "#fee2e2", text: "#991b1b" },
};

const GovernmentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "All", search: "" });
  const [updating, setUpdating] = useState(null);
  const [statusSelections, setStatusSelections] = useState({});
  const [noteInputs, setNoteInputs] = useState({});

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        getAdminStats(),
        getAdminComplaints({
          status: filters.status,
          search: filters.search,
          limit: 50,
        }),
      ]);
      setStats(statsRes.data.stats);
      setComplaints(complaintsRes.data.complaints);
    } catch (err) {
      console.error(err);
      alert("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id) => {
    const newStatus = statusSelections[id];
    const adminNote = noteInputs[id] || "";

    if (!newStatus) return alert("Please select a status.");

    setUpdating(id);
    try {
      const { data } = await updateComplaintStatus(id, {
        status: newStatus,
        adminNote,
      });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? data.complaint : c))
      );
      alert(`Status updated to "${newStatus}"`);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint? This cannot be undone.")) return;
    try {
      await deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <span style={{ fontSize: "1.5rem" }}>🏛️</span>
          <div>
            <div style={styles.sidebarTitle}>Admin Panel</div>
            <div style={styles.sidebarSub}>MCC Dashboard</div>
          </div>
        </div>

        <div style={styles.sidebarUser}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{user?.name}</div>
            <div style={{ fontSize: "0.75rem", color: "#93c5fd" }}>{user?.email}</div>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          ⬅ Logout
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <h1 style={styles.pageTitle}>Dashboard Overview</h1>

        {/* Stats */}
        {stats && (
          <div style={styles.statsGrid}>
            {[
              { label: "Total Complaints", value: stats.total, color: "#3b82f6" },
              { label: "Pending", value: stats.pending, color: "#f59e0b" },
              { label: "In Progress", value: stats.inProgress, color: "#6366f1" },
              { label: "Resolved", value: stats.resolved, color: "#10b981" },
              { label: "Registered Users", value: stats.totalUsers, color: "#8b5cf6" },
              { label: "New (7 days)", value: stats.recentComplaints, color: "#ec4899" },
            ].map((s) => (
              <div key={s.label} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
                <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Complaints Table */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Manage Complaints</h2>
            <div style={styles.filterRow}>
              <input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                style={styles.searchInput}
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                style={styles.select}
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ padding: "2rem" }}>Loading...</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Filed By</th>
                    <th style={styles.th}>Votes</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Government Action</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => {
                    const sc = STATUS_COLORS[c.status] || STATUS_COLORS["Pending"];
                    return (
                      <tr key={c._id} style={styles.tableRow}>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{c.title}</td>
                        <td style={styles.td}>
                          <span style={styles.catBadge}>{c.category}</span>
                        </td>
                        <td style={styles.td}>{c.location}</td>
                        <td style={styles.td}>{c.userName}</td>
                        <td style={{ ...styles.td, textAlign: "center" }}>👍 {c.supportCount}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.text }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ ...styles.td, maxWidth: "220px", whiteSpace: "normal" }}>
                          {c.adminNote || "—"}
                        </td>
                        <td style={styles.td}>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            <select
                              defaultValue={c.status}
                              onChange={(e) =>
                                setStatusSelections((prev) => ({ ...prev, [c._id]: e.target.value }))
                              }
                              style={styles.actionSelect}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                            <input
                              placeholder="Note (optional)"
                              value={noteInputs[c._id] || ""}
                              onChange={(e) =>
                                setNoteInputs((prev) => ({ ...prev, [c._id]: e.target.value }))
                              }
                              style={styles.noteInput}
                            />
                            <button
                              onClick={() => handleStatusUpdate(c._id)}
                              disabled={updating === c._id}
                              style={styles.updateBtn}
                            >
                              {updating === c._id ? "..." : "Update"}
                            </button>
                            <button onClick={() => handleDelete(c._id)} style={styles.deleteBtn}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Styles remain the same as your original code
const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: "40px", display: "flex" },
  sidebar: {
    width: "240px",
    background: "#1e3a8a",
    color: "#fff",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sidebarBrand: { display: "flex", alignItems: "center", gap: "10px" },
  sidebarTitle: { fontWeight: 700, fontSize: "1.1rem" },
  sidebarSub: { fontSize: "0.8rem", color: "#93c5fd" },
  sidebarUser: { display: "flex", gap: "10px", alignItems: "center" },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1rem",
  },
  logoutBtn: { marginTop: "auto", padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "#ef4444", color: "#fff" },
  main: { flex: 1, marginLeft: "20px" },
  pageTitle: { fontSize: "28px", fontWeight: 700, marginBottom: "20px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  statValue: { fontSize: "20px", fontWeight: 700 },
  statLabel: { fontSize: "12px", color: "#64748b" },
  section: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  sectionTitle: { fontSize: "18px", fontWeight: 700 },
  filterRow: { display: "flex", gap: "10px" },
  searchInput: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" },
  select: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { background: "#f1f5f9" },
  th: { padding: "8px", textAlign: "left", fontWeight: 600 },
  td: { padding: "8px", borderBottom: "1px solid #e2e8f0", verticalAlign: "top" },
  tableRow: {},
  statusBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 },
  catBadge: { background: "#e0e7ff", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" },
  actionGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  actionSelect: { padding: "4px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" },
  noteInput: { padding: "4px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" },
  updateBtn: { padding: "6px", borderRadius: "6px", border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer" },
  deleteBtn: { padding: "6px", borderRadius: "6px", border: "none", background: "#ef4444", color: "#fff", cursor: "pointer" },
};

export default GovernmentDashboard;
