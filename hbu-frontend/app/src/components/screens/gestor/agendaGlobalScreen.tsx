"use client";

import { useToast } from "@/app/src/contexts/toastContext";
import { getEquipeCirurgia } from "@/app/src/services/cirurgiaEquipeService";
import {
  cancelarCirurgia,
  getCirurgias,
} from "@/app/src/services/cirurgiaService";
import { CirurgiaResponseDTO } from "@/app/src/types/cirurgia";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  Ban,
  Bed,
  CalendarDays,
  ChevronRight,
  Loader2,
  Lock,
  Stethoscope,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type CirurgiaComStatus = CirurgiaResponseDTO & {
  liberadaParaExecucao: boolean;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function AgendaGlobalScreen() {
  const router = useRouter();
  const { addToast } = useToast();
  const [cirurgias, setCirurgias] = useState<CirurgiaComStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalCancelamentoAberto, setModalCancelamentoAberto] = useState(false);
  const [cirurgiaParaCancelar, setCirurgiaParaCancelar] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [isProcessando, setIsProcessando] = useState(false);

  const carregarAgenda = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCirurgias();
      const dados = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];

      const cirurgiasValidadas = await Promise.all(
        dados.map(async (c: CirurgiaResponseDTO) => {
          try {
            const reqEquipe = await getEquipeCirurgia(c.id);
            const equipe = reqEquipe.data || [];
            const temEquipe = equipe.some(
              (e: any) => e.papel === "CIRURGIAO_PRINCIPAL",
            );
            return { ...c, liberadaParaExecucao: temEquipe };
          } catch {
            return { ...c, liberadaParaExecucao: false };
          }
        }),
      );

      setCirurgias(cirurgiasValidadas);
    } catch (error: any) {
      addToast(error.message || "Erro ao carregar a agenda global.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    carregarAgenda();
  }, [carregarAgenda]);

  const handleAbrirModalCancelamento = (id: string) => {
    setCirurgiaParaCancelar(id);
    setMotivoCancelamento("");
    setModalCancelamentoAberto(true);
  };

  const handleConfirmarCancelamento = async () => {
    if (!motivoCancelamento.trim() || motivoCancelamento.length < 10) {
      addToast(
        "Forneça um motivo detalhado (mínimo de 10 caracteres) para o cancelamento.",
        "warning"
      );
      return;
    }

    if (!cirurgiaParaCancelar) return;

    try {
      setIsProcessando(true);
      await cancelarCirurgia(cirurgiaParaCancelar, { motivoCancelamento });
      addToast(
        "Cirurgia cancelada com sucesso. A equipe foi desalocada.",
        "success"
      );
      setModalCancelamentoAberto(false);

      await carregarAgenda();
      
    } catch (error: any) {
      addToast("Erro ao tentar cancelar a cirurgia.", "error");
    } finally {
      setIsProcessando(false);
    }
  };

  const formatarHora = (isoString: string) => {
    if (!isoString) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--:--";
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-blue-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">Sincronizando agenda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="text-blue-600" /> Agenda Cirúrgica Global
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestão macro de todos os procedimentos agendados no centro cirúrgico.
          </p>
        </div>
      </div>

      {cirurgias.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Stethoscope className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            Nenhum procedimento agendado
          </h3>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {cirurgias.map((cirurgia) => {
            const nomePaciente =
              cirurgia.pacienteNome ||
              cirurgia.paciente?.nome ||
              "Paciente não identificado";
            const nomeSala =
              cirurgia.salaNomeNumero ||
              cirurgia.sala?.nomeNumero ||
              "Sala não definida";
            const isAgendado = cirurgia.statusAtual === "AGENDADO";

            return (
              <motion.div
                key={cirurgia.id}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row group transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="bg-slate-50 sm:w-48 p-6 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center border-b sm:border-b-0 sm:border-r border-slate-100 shrink-0 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Início Previsto
                    </span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">
                      {formatarHora(cirurgia.inicioPrevisto)}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isAgendado
                        ? "bg-amber-50 text-amber-600 border-amber-200"
                        : cirurgia.statusAtual === "EM_ANDAMENTO"
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}
                  >
                    {cirurgia.statusAtual.replace("_", " ")}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <User className="text-slate-400" size={18} />{" "}
                      {nomePaciente}
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getPrioridadeBadge(cirurgia.prioridade)}`}
                    >
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
                      onClick={() =>
                        router.push(`/medico/cirurgia/${cirurgia.id}`)
                      }
                      className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 px-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group-hover:scale-105"
                    >
                      Abrir Cockpit <ChevronRight size={18} />
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-full sm:w-auto bg-slate-100 border border-slate-200 text-slate-500 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                        <Lock size={16} /> Aguardando Escala
                      </div>

                      {cirurgia.statusAtual !== "CANCELADO" &&
                        cirurgia.statusAtual !== "FINALIZADO" && (
                          <button
                            onClick={() =>
                              handleAbrirModalCancelamento(cirurgia.id)
                            }
                            className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors w-full justify-center cursor-pointer"
                            title="Cancelar Cirurgia"
                          >
                            <Ban size={16} />
                            <span>Cancelar</span>
                          </button>
                        )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal de Cancelamento com AnimatePresence para saída fluida */}
      <AnimatePresence>
        {modalCancelamentoAberto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-rose-100 rounded-full text-rose-600">
                  <Ban size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Cancelar Cirurgia
                </h3>
              </div>

              <p className="text-sm font-medium text-slate-600 mb-5 leading-relaxed">
                Esta ação é irreversível. A cirurgia sairá do mapa e toda a equipe
                médica alocada terá a agenda liberada. Por favor, registre a
                justificativa.
              </p>

              <textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Ex: Falta de material cirúrgico, paciente não compareceu à internação prévia..."
                className="w-full min-h-30 p-4 border border-slate-300 bg-slate-50 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none mb-6 text-sm transition-all shadow-inner"
                disabled={isProcessando}
              />

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setModalCancelamentoAberto(false)}
                  disabled={isProcessando}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmarCancelamento}
                  disabled={isProcessando}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center min-w-45 disabled:opacity-70 shadow-sm cursor-pointer"
                >
                  {isProcessando ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirmar Cancelamento"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}