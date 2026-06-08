"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remover após 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success": return <CheckCircle2 className="text-emerald-500 w-5 h-5" />;
      case "error": return <AlertCircle className="text-rose-500 w-5 h-5" />;
      case "warning": return <AlertCircle className="text-amber-500 w-5 h-5" />;
      case "info": return <Info className="text-blue-500 w-5 h-5" />;
    }
  };

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case "success": return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "error": return "bg-rose-50 border-rose-200 text-rose-800";
      case "warning": return "bg-amber-50 border-amber-200 text-amber-800";
      case "info": return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container fixado no canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full animate-in slide-in-from-right-8 fade-in duration-300 ${getToastStyle(toast.type)}`}
          >
            <div className="shrink-0 mt-0.5">{getToastIcon(toast.type)}</div>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast deve ser usado dentro de um ToastProvider");
  return context;
};