"use client";

import { AuthProvider } from "@/app/src/contexts/authContext";
import { ToastProvider } from "@/app/src/contexts/toastContext";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider> 
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  );
}