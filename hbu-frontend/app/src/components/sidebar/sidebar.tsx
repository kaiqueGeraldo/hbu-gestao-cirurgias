"use client";

import { useAuthContext } from "@/app/src/contexts/authContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, Bed,
  CalendarDays,
  CalendarPlus,
  ChevronLeft, ChevronRight,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Stethoscope,
  Users,
  UsersRound,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MENU_MODULES = [
  {
    category: "Recepção",
    roles: ["ROLE_RECEPCAO", "ROLE_ADMIN"],
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/recepcao/dashboard" },
      { label: "Pacientes", icon: Users, href: "/recepcao/pacientes" },
      { label: "Agendar Cirurgia", icon: CalendarPlus, href: "/recepcao/agendar" },
      { label: "Agenda Cirúrgica", icon: CalendarDays, href: "/recepcao/agenda" },
    ]
  },
  {
    category: "Corpo Clínico",
    roles: ["ROLE_MEDICO"],
    items: [
      { label: "Minha Agenda", icon: CalendarDays, href: "/medico/agenda" },
    ]
  },
  {
    category: "Gestão do CC",
    roles: ["ROLE_GESTOR_CC", "ROLE_ADMIN"],
    items: [
      { label: "Agenda Global", icon: CalendarDays, href: "/gestor/agenda-global" },
      { label: "Mapa Cirúrgico", icon: Activity, href: "/gestor/mapa" },
      { label: "Escala de Equipes", icon: UsersRound, href: "/gestor/escalas" },
      { label: "Salas", icon: Bed, href: "/gestor/salas" },
      { label: "Procedimentos TUSS", icon: Stethoscope, href: "/gestor/catalogo-tuss" },
      { label: "Profissionais", icon: UsersRound, href: "/gestor/profissionais" },
    ]
  },
  {
    category: "Administração",
    roles: ["ROLE_ADMIN"],
    items: [
      { label: "Usuários e Acessos", icon: ShieldAlert, href: "/admin/usuarios" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const allowedMenus = MENU_MODULES.flatMap(module => 
    user && module.roles.includes(user.role) ? module.items : []
  );

  const formatRoleDisplay = (role?: string) => {
    if (!role) return "";
    return role.replace("ROLE_", "").replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <aside className={`bg-[#0B1120] text-slate-300 h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out shrink-0 shadow-2xl z-40 ${isExpanded ? "w-72" : "w-20"}`}>
        
        <button onClick={() => setIsExpanded(!isExpanded)} className="absolute -right-3 top-8 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-500 transition-colors cursor-pointer z-50 border-4 border-slate-50">
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`p-6 flex items-center transition-all overflow-hidden whitespace-nowrap ${isExpanded ? "gap-3" : "justify-center px-0"}`}>
          <div className="bg-blue-600 p-2 rounded-xl shrink-0 shadow-lg shadow-blue-500/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          {isExpanded && (
            <div className="animate-in fade-in duration-300">
              <span className="text-white font-black text-xl tracking-tight leading-none block">HBU</span>
              <span className="text-blue-400 text-[10px] font-bold tracking-widest uppercase">Centro Cirúrgico</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-x-hidden overflow-y-auto">
          {allowedMenus.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href} title={!isExpanded ? item.label : ""} className={`flex items-center gap-3 rounded-xl transition-all font-medium text-sm overflow-hidden whitespace-nowrap ${isExpanded ? "px-4 py-3" : "justify-center p-3"} ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "hover:bg-white/5 hover:text-white"}`}>
                <Icon size={isExpanded ? 18 : 22} className="shrink-0" />
                {isExpanded && <span className="animate-in fade-in duration-300">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto bg-black/20">
          {isExpanded ? (
            <div className="flex items-center gap-3 px-2 mb-4 animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                {user?.sub?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.sub || "Usuário"}</p>
                <p className="text-xs text-blue-400 truncate">{formatRoleDisplay(user?.role)}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
               <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                {user?.sub?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className={`flex items-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors font-bold text-sm cursor-pointer ${isExpanded ? "gap-3 px-4 py-2.5 w-full" : "justify-center p-3 w-full"}`}
            title={!isExpanded ? "Sair do sistema" : ""}
          >
            <LogOut size={isExpanded ? 18 : 22} className="shrink-0" />
            {isExpanded && <span className="animate-in fade-in duration-300">Sair do sistema</span>}
          </button>
        </div>
      </aside>

      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT ANIMADO */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur Fade */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setIsLogoutModalOpen(false)} 
            />
            
            {/* Modal Zoom/Slide */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <LogOut size={20} className="text-rose-500" /> Confirmar Saída
                </h2>
                <button onClick={() => setIsLogoutModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-sm text-slate-600">
                  Tem certeza que deseja desconectar sua sessão atual do sistema HBU?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 cursor-pointer transition-colors">
                    Cancelar
                  </button>
                  <button onClick={logout} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-colors">
                    Sair do Sistema
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}