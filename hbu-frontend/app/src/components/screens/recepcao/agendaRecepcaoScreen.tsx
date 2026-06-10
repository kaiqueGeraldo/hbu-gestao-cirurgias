"use client";

import { useToast } from "@/app/src/contexts/toastContext";
import { getCirurgias } from "@/app/src/services/cirurgiaService";
import { CirurgiaResponseDTO } from "@/app/src/types/cirurgia";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
    Activity,
    Bed,
    Clock,
    Filter,
    Loader2,
    Stethoscope,
    User
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

type TipoFiltro = 'ATIVAS' | 'TODAS' | 'AGENDADO' | 'EM_PREPARO' | 'EM_ANDAMENTO' | 'EM_LIMPEZA' | 'FINALIZADO' | 'CANCELADO';

export default function AgendaRecepcaoScreen() {
  const { addToast } = useToast();
  const [cirurgias, setCirurgias] = useState<CirurgiaResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<TipoFiltro>('ATIVAS');

  const carregarAgenda = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCirurgias();
      const dados = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];
      
      // Ordena por horário previsto mais próximo
      const dadosOrdenados = dados.sort((a: any, b: any) => 
        new Date(a.inicioPrevisto).getTime() - new Date(b.inicioPrevisto).getTime()
      );
      
      setCirurgias(dadosOrdenados);
    } catch (error: any) {
      addToast(error.message || "Erro ao carregar a agenda cirúrgica.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    carregarAgenda();
    const intervalId = setInterval(carregarAgenda, 120000);
    return () => clearInterval(intervalId);
  }, [carregarAgenda]);

  const formatarDataHora = (isoString: string) => {
    if (!isoString) return "--/--/---- --:--";
    try {
      const date = new Date(isoString);
      const dataFormatada = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      const horaFormatada = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${dataFormatada} às ${horaFormatada}`;
    } catch {
      return "--/--/---- --:--";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AGENDADO":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "EM_PREPARO":
        return "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200";
      case "EM_ANDAMENTO":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "EM_LIMPEZA":
        return "bg-cyan-50 text-cyan-600 border-cyan-200";
      case "FINALIZADO":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "CANCELADO":
        return "bg-rose-50 text-rose-600 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case "EMERGENCIA":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "URGENCIA":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const cirurgiasFiltradas = cirurgias.filter((c) => {
    if (filtroAtivo === 'ATIVAS') {
      return ['AGENDADO', 'EM_PREPARO', 'EM_ANDAMENTO', 'EM_LIMPEZA'].includes(c.statusAtual);
    }
    if (filtroAtivo === 'TODAS') return true;
    return c.statusAtual === filtroAtivo;
  });

  const abasFiltro: { id: TipoFiltro; label: string }[] = [
    { id: 'ATIVAS', label: 'Mapa Ativo' },
    { id: 'TODAS', label: 'Todas' },
    { id: 'AGENDADO', label: 'Agendadas' },
    { id: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { id: 'FINALIZADO', label: 'Finalizadas' },
    { id: 'CANCELADO', label: 'Canceladas' },
  ];

  if (isLoading && cirurgias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-blue-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">Sincronizando painel da recepção...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-blue-600" /> Painel de Acompanhamento
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visualização em tempo real do mapa do Centro Cirúrgico para atendimento e orientação.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Clock size={16} className="text-blue-500 animate-pulse"/> Atualização Automática
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="px-3 text-slate-400">
            <Filter size={18} />
        </div>
        {abasFiltro.map((aba) => (
            <button
                key={aba.id}
                onClick={() => setFiltroAtivo(aba.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    filtroAtivo === aba.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
            >
                {aba.label}
            </button>
        ))}
      </div>

      {cirurgiasFiltradas.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Stethoscope className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            Nenhum procedimento encontrado
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Não há registros correspondentes ao filtro "{abasFiltro.find(a => a.id === filtroAtivo)?.label}".
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
            <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
            {cirurgiasFiltradas.map((cirurgia) => {
                const nomePaciente = cirurgia.pacienteNome || cirurgia.paciente?.nome || "Paciente não identificado";
                const nomeSala = cirurgia.salaNomeNumero || cirurgia.sala?.nomeNumero || "Sala não definida";

                return (
                <motion.div
                    key={cirurgia.id}
                    layout
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:border-blue-300 hover:shadow-md"
                >
                    <div className="p-5 border-b border-slate-100 flex justify-between items-start md:items-center bg-slate-50/50 flex-col md:flex-row gap-3 md:gap-0">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Início Previsto
                        </span>
                        <span className="text-lg font-black text-slate-900 flex items-center gap-2">
                        {formatarDataHora(cirurgia.inicioPrevisto)}
                        </span>
                    </div>
                    <div className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border whitespace-nowrap ${getStatusBadge(cirurgia.statusAtual)}`}>
                        {cirurgia.statusAtual.replace("_", " ")}
                    </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-center space-y-4">
                    <div className="flex items-start justify-between">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 line-clamp-1">
                        <User className="text-slate-400 shrink-0" size={18} /> {nomePaciente}
                        </h3>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border shrink-0 ml-2 ${getPrioridadeBadge(cirurgia.prioridade)}`}>
                        {cirurgia.prioridade}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Bed size={16} className="text-slate-400" /> {nomeSala}
                        </div>
                    </div>
                    </div>
                </motion.div>
                );
            })}
            </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}