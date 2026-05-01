import Sidebar from "./components/Sidebar";
import AIMedewerkerPanel from "./components/AIMedewerkerPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden ui-app-shell">
      <Sidebar />
      <div className="dashboard-skin flex-1 flex min-w-0 min-h-0 flex-col overflow-auto pt-14 md:pt-0">
        {children}
      </div>
      <AIMedewerkerPanel />
    </div>
  );
}
