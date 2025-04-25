
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="flex flex-1">
          <Sidebar />
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 z-20 bg-black/50 md:hidden"
                onClick={toggleSidebar}
              />
              <Sidebar isMobile />
            </>
          )}
          <main className="flex-1 px-4 py-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
