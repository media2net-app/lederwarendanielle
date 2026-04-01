import Sidebar from "./components/Sidebar";
import AIMedewerkerPanel from "./components/AIMedewerkerPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="dashboard-skin flex-1 flex flex-col min-w-0 min-h-0 overflow-auto">
        {children}
      </div>
      <AIMedewerkerPanel />
    </div>
  );
}
