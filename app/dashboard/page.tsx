import React, { Suspense } from "react";
import Dashboard from "@/components/Dashboard";

const DashboardPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <Dashboard />
    </Suspense>
  );
};

export default DashboardPage;
