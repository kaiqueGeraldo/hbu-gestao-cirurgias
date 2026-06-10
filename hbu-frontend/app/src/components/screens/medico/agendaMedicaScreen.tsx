"use client";

import { useToast } from "@/app/src/contexts/toastContext";
import { getMinhasCirurgias } from "@/app/src/services/cirurgiaService";
import { CirurgiaResponseDTO } from "@/app/src/types/cirurgia";
import { motion, Variants } from "framer-motion";
import { Bed, CalendarDays, ChevronRight, Loader2, Lock, Stethoscope, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type CirurgiaComStatus = CirurgiaResponseDTO & { liberadaParaExecucao: boolean };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AgendaMedicaScreen() {
  const router = useRouter();
  const { addToast } = useToast();
  const [cirurgias, setCirurgias] = useState<CirurgiaComStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregarAgenda = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await getMinhasCirurgias();
    const dados = Array.isArray(response.data) ? response.data : response.data.content || [];
    setCirurgias(dados);
  } catch (error: any) {
    addToast(error.response?.data?.message || "Erro ao carregar sua agenda pessoal.", "error");
  } finally {
    setIsLoading(false);
  }
}, [addToast]);

  useEffect(() => {
    carregarAgenda();
  }, [carregarAgenda]);

  const formatarDataHora = (isoString: string) => {
    if (!isoString) return "--/--/---- --:--";
    try {
      const date = new Date(isoString);
      const dataFormatada = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      const horaFormatada = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return `${dataFormatada} às ${horaFormatada}`;
    } catch {
      return "--/--/---- --:--";
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case "EMERGENCIA": return "bg-rose-100 text-rose-700 border-rose-200";
      case "URGENCIA": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-blue-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">Sincronizando sua agenda exclusiva...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="text-blue-600" /> Minha Agenda Cirúrgica
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visualize os procedimentos onde você está escalado e assuma o controle no cockpit.
          </p>
        </div>
      </div>

      {cirurgias.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Stethoscope className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Agenda Livre</h3>
          <p className="text-slate-500 text-sm mt-1">Você não possui procedimentos escalados no momento.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {cirurgias.map((cirurgia) => {
            const nomePaciente = cirurgia.pacienteNome || cirurgia.paciente?.nome || "Paciente não identificado";
            const nomeSala = cirurgia.salaNomeNumero || cirurgia.sala?.nomeNumero || "Sala não definida";
            const isAgendado = cirurgia.statusAtual === "AGENDADO";

            return (
              <motion.div key={cirurgia.id} variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row group transition-all hover:border-blue-300 hover:shadow-md">
                <div className="bg-slate-50 sm:w-56 p-6 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center border-b sm:border-b-0 sm:border-r border-slate-100 shrink-0 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Início Previsto</span>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">{formatarDataHora(cirurgia.inicioPrevisto)}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${
                    isAgendado ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                    cirurgia.statusAtual === 'EM_ANDAMENTO' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {cirurgia.statusAtual.replace("_", " ")}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><User className="text-slate-400" size={18} /> {nomePaciente}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getPrioridadeBadge(cirurgia.prioridade)}`}>
                      {cirurgia.prioridade}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                    <Bed size={16} className="text-slate-400" /> {nomeSala}
                  </div>
                </div>

                <div className="p-6 flex items-center justify-end bg-slate-50/50 sm:bg-transparent border-t sm:border-t-0 border-slate-100">
                  {cirurgia.liberadaParaExecucao ? (
                    <button 
                      onClick={() => router.push(`/medico/cirurgia/${cirurgia.id}`)}
                      className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group-hover:scale-105"
                    >
                      Abrir Cockpit <ChevronRight size={18} />
                    </button>
                  ) : (
                    <div className="w-full sm:w-auto bg-slate-100 border border-slate-200 text-slate-500 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                      <Lock size={16} /> Aguardando Escala Completa
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}