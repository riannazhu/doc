import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { Header } from "@/components/dashboard/Header";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col">
        <Header />
        <ChatInterface />
      </div>
    </div>
  );
};

export default Dashboard;
