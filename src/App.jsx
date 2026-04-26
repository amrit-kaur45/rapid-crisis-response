import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CommandCenter from "./pages/CommandCenter";
import SOSReport from "./pages/SOSReport";
import IncidentMap from "./pages/IncidentMap";
import { StaffDispatch, Broadcast, IncidentLog, GuestSOS } from "./pages/index.js";

export default function App() {
  const [page, setPage] = useState("command");
  const [role, setRole] = useState("coordinator");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (role === "guest") return <GuestSOS setRole={setRole} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Navbar role={role} setRole={setRole} setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} navigate={setPage} currentPage={page} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden", marginTop: "var(--navbar-h)" }}>
        <Sidebar navigate={setPage} currentPage={page} isOpen={sidebarOpen} />
        <main style={{ flex: 1, overflowY: "auto", marginLeft: sidebarOpen ? "var(--sidebar-w)" : 0, transition: "margin-left .25s", background: "var(--bg)" }}>
          {page === "command"   && <CommandCenter navigate={setPage} />}
          {page === "sos"       && <SOSReport navigate={setPage} />}
          {page === "map"       && <IncidentMap />}
          {page === "dispatch"  && <StaffDispatch />}
          {page === "broadcast" && <Broadcast />}
          {page === "log"       && <IncidentLog />}
        </main>
      </div>
    </div>
  );
}