"use client";

import { useToast } from "@/app/src/contexts/toastContext";
import { ApiError } from "@/app/src/services/api";
import { createPaciente, updatePaciente } from "@/app/src/services/pacienteService";
import { PacienteResponseDTO } from "@/app/src/types/paciente";
import { maskCPF, maskDate } from "@/app/src/utils/masks";
import { AnimatePresence, motion } from "framer-motion"; // Importando o Framer Motion
import { Calendar, CreditCard, Loader2, Save, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";

type PacienteSideModalProps = {
  isOpen: boolean;
  onClose: (foiSalvo: boolean) => void;
  paciente: PacienteResponseDTO | null;
};

export default function PacienteSideModal({ isOpen, onClose, paciente }: PacienteSideModalProps) {
  const { addToast } = useToast();
  const isEditing = !!paciente;

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Efeito para preencher os dados quando o modal abre (ou limpa se for novo)
  useEffect(() => {
    if (paciente && isOpen) {
      // Converte YYYY-MM-DD do backend para DD/MM/YYYY para a tela
      const [year, month, day] = paciente.dataNascimento.split("-");
      setFormData({
        nome: paciente.nome,
        cpf: maskCPF(paciente.cpf),
        dataNascimento: `${day}/${month}/${year}`,
      });
    } else if (!isOpen) {
      // Limpa o form ao fechar para não dar flickering na próxima vez que abrir
      setTimeout(() => setFormData({ nome: "", cpf: "", dataNascimento: "" }), 300);
    }
  }, [paciente, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const [day, month, year] = formData.dataNascimento.split("/");
      const dateForApi = `${year}-${month}-${day}`;

      const cpfForApi = formData.cpf.replace(/\D/g, "");

      if (isEditing && paciente) {
        await updatePaciente(paciente.id, { nome: formData.nome });
        addToast("Prontuário atualizado com sucesso!", "success");
      } else {
        await createPaciente({
          nome: formData.nome,
          cpf: cpfForApi,
          dataNascimento: dateForApi,
        });
        addToast("Paciente cadastrado com sucesso!", "success");
      }
      onClose(true);
    } catch (err: any) {
      if (err instanceof ApiError) {
        addToast(err.message, "error");
      } else {
        addToast("Erro inesperado ao salvar o prontuário.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY ESCURO (Animação de Fade) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 h-full" 
            onClick={() => onClose(false)} 
          />
          
          {/* DRAWER LATERAL (Animação de Slide) */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            
            {/* Header do Drawer */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{isEditing ? "Editar Paciente" : "Novo Paciente"}</h2>
                <p className="text-sm text-slate-500 mt-1">Preencha os dados básicos do prontuário</p>
              </div>
              <button 
                onClick={() => onClose(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo do Formulário */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="paciente-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" required value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">CPF</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" required value={formData.cpf}
                      disabled={isEditing} 
                      onChange={(e) => setFormData({...formData, cpf: maskCPF(e.target.value)})}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50 transition-all font-medium tracking-wide"
                    />
                  </div>
                  {isEditing && (
                    <p className="text-[10px] text-slate-400 ml-1">O CPF não pode ser alterado após o cadastro.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Data de Nascimento</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" required value={formData.dataNascimento}
                      disabled={isEditing}
                      onChange={(e) => setFormData({...formData, dataNascimento: maskDate(e.target.value)})}
                      placeholder="DD/MM/AAAA"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50 transition-all font-medium tracking-wide"
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Footer de Ações */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                type="button" 
                onClick={() => onClose(false)} 
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="paciente-form" 
                disabled={isLoading} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Salvar</>}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}