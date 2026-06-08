import Sidebar from "@/app/src/components/sidebar/sidebar";
import React from "react";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen w-full relative">
        <div className="p-6 md:p-8 max-w-350 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}