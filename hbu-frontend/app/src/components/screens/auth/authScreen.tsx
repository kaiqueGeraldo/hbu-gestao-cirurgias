// src/components/screens/auth/AuthScreen.tsx
"use client";

import { useAuthContext } from "@/app/src/contexts/authContext";
import { ApiError } from "@/app/src/services/api";
import { motion } from "framer-motion";
import { Activity, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";

export default function AuthScreen() {
  const { login, isLoading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setApiError(null);
    try {
      await login({ email, senha });
    } catch (error: any) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError("Erro inesperado ao conectar com o servidor.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* BACKGROUND ANIMADO HOSPITALAR (Azul Médico) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
        
        {/* CABEÇALHO */}
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-linear-to-tr from-blue-600 to-blue-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
            <Activity className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">HBU Unimar</h1>
          <p className="text-slate-500 text-sm">
            Gestão de Centro Cirúrgico
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div className="p-8 pt-8">
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* E-mail */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Usuário Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="email@hbu.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Alerta de Erro */}
            {apiError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{apiError}</p>
              </motion.div>
            )}

            {/* Botão */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Acesso Restrito <ArrowRight size={18} /></>
              )}
            </button>
          </motion.form>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-xs">
            Acesso exclusivo para colaboradores autorizados.<br/>
            Dúvidas? Contate o TI.
          </p>
        </div>
      </div>
    </div>
  );
}