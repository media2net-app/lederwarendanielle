import Sidebar from "./components/Sidebar";
import AIMedewerkerPanel from "./components/AIMedewerkerPanel";
import Rondleiding from "./components/Rondleiding";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto">
        {children}
      </div>
      <AIMedewerkerPanel />
      <Rondleiding />
    </div>
  );
}
