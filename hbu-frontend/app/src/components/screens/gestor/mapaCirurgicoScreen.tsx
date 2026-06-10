"use client";

import { useToast } from "@/app/src/contexts/toastContext";
import { getCirurgias, reagendarCirurgia } from "@/app/src/services/cirurgiaService";
import { getSalas } from "@/app/src/services/salaService";
import { CirurgiaResponseDTO } from "@/app/src/types/cirurgia";
import { SalaCirurgicaResponseDTO } from "@/app/src/types/sala";
import { motion } from "framer-motion";
import { Activity, AlertCircle, Calendar as CalendarIcon, Clock, Loader2, Maximize, Minimize } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const HORAS_DIA = Array.from({ length: 24 }, (_, i) => i);
const HORA_INICIO_GANTT = 0;
const TOTAL_HORAS = 24;

const formatarIsoSeguro = (val: any): string => {
  if (!val) return "";
  if (Array.isArray(val)) {
    const [y, m, d, h, min] = val;
    const pad = (n: number) => String(n || 0).padStart(2, '0');
    return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:00-03:00`;
  }
  return String(val);
};

export default function MapaCirurgicoScreen() {
  const { addToast } = useToast();
  
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [salas, setSalas] = useState<SalaCirurgicaResponseDTO[]>([]);
  const [cirurgias, setCirurgias] = useState<CirurgiaResponseDTO[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [cirurgiaSendoArrastada, setCirurgiaSendoArrastada] = useState<CirurgiaResponseDTO | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);

  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resSalas, resCirurgias] = await Promise.all([getSalas(), getCirurgias()]);
      
      const salasAtivas = (resSalas.data || []).filter((s: any) => s.statusOperacional !== "INATIVA");
      setSalas(salasAtivas);

      const dadosCirurgias = Array.isArray(resCirurgias.data) ? resCirurgias.data : resCirurgias.data.content || [];
      
      const cirurgiasDoDia = dadosCirurgias.filter((c: any) => {
        const inicioSeguro = formatarIsoSeguro(c.inicioPrevisto);
        return inicioSeguro.startsWith(dataSelecionada);
      });
      
      setCirurgias(cirurgiasDoDia);

    } catch (error) {
      addToast("Erro ao carregar o mapa cirúrgico. Verifique a conexão com a API.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [dataSelecionada, addToast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const extrairHoraMinuto = (isoString: string) => {
    const dataSegura = formatarIsoSeguro(isoString);
    const date = new Date(dataSegura);
    return date.getHours() + (date.getMinutes() / 60);
  };

  const calcularPosicaoGantt = (inicioIso: string, fimIso: string) => {
    const inicio = extrairHoraMinuto(inicioIso);
    const fim = extrairHoraMinuto(fimIso);
    
    const startOffset = inicio - HORA_INICIO_GANTT;
    const duracao = Math.max(fim - inicio, 0.5);

    const left = (startOffset / TOTAL_HORAS) * 100;
    const width = (duracao / TOTAL_HORAS) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${width}%` };
  };

  // MÁQUINA DE CORES: MAPEANDO TODOS OS 7 STATUS DO DTO
  const getCorBarra = (status: string, prioridade: string) => {
    if (prioridade === "EMERGENCIA") return "bg-rose-500 border-rose-600 shadow-rose-500/30 text-white";
    switch (status) {
      case "FILA_ESPERA": return "bg-neutral-500 border-neutral-600 shadow-neutral-500/30 text-white";
      case "AGENDADO": return "bg-blue-500 border-blue-600 shadow-blue-500/30 text-white";
      case "EM_PREPARO": return "bg-amber-400 border-amber-500 shadow-amber-400/30 text-amber-900";
      case "EM_ANDAMENTO": return "bg-purple-500 border-purple-600 shadow-purple-500/30 text-white";
      case "EM_LIMPEZA": return "bg-emerald-500 border-emerald-600 shadow-emerald-500/30 text-white";
      case "FINALIZADO": return "bg-slate-400 border-slate-500 shadow-slate-400/30 text-white";
      case "CANCELADO": return "bg-red-600 border-red-700 shadow-red-600/30 text-white";
      default: return "bg-blue-500 border-blue-600 shadow-blue-500/30 text-white";
    }
  };

  const handleDragStart = (e: React.DragEvent, cirurgia: CirurgiaResponseDTO) => {
    if (cirurgia.statusAtual === "FINALIZADO" || cirurgia.statusAtual === "CANCELADO") {
      e.preventDefault();
      addToast("Não é possível reagendar cirurgias finalizadas ou canceladas.", "warning");
      return;
    }
    setCirurgiaSendoArrastada(cirurgia);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setCirurgiaSendoArrastada(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, salaDestinoId: string | number, horaDestino: number) => {
    e.preventDefault();
    if (!cirurgiaSendoArrastada) return;

    const inicioAntigo = extrairHoraMinuto(cirurgiaSendoArrastada.inicioPrevisto);
    const fimAntigo = extrairHoraMinuto(cirurgiaSendoArrastada.fimPrevisto);
    const duracao = fimAntigo - inicioAntigo;

    const novoInicioIso = `${dataSelecionada}T${horaDestino.toString().padStart(2, '0')}:00:00-03:00`;
    const novoFimHora = Math.floor(horaDestino + duracao);
    const novoFimMinuto = Math.round(((horaDestino + duracao) % 1) * 60);
    const novoFimIso = `${dataSelecionada}T${novoFimHora.toString().padStart(2, '0')}:${novoFimMinuto.toString().padStart(2, '0')}:00-03:00`;

    const cirurgiasBackup = [...cirurgias];
    setCirurgias(cirurgias.map(c => 
      c.id === cirurgiaSendoArrastada.id 
        ? { ...c, salaId: salaDestinoId, inicioPrevisto: novoInicioIso, fimPrevisto: novoFimIso } 
        : c
    ));

    try {
      await reagendarCirurgia(cirurgiaSendoArrastada.id, {
        salaId: String(salaDestinoId),
        inicioPrevisto: novoInicioIso,
        fimPrevisto: novoFimIso
      });
      addToast("Reagendamento confirmado com sucesso.", "success");
      carregarDados(); 
    } catch (error: any) {
      setCirurgias(cirurgiasBackup);
      addToast(error.message || "Conflito de agendamento. Esta sala não está disponível neste horário.", "error");
    } finally {
      handleDragEnd();
    }
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-99 bg-slate-50 p-4 sm:p-6 overflow-y-auto" : "space-y-6"}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mapa Cirúrgico (Gantt)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Exibindo escala de: <strong className="text-blue-600">{dataSelecionada.split('-').reverse().join('/')}</strong>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus-within:border-blue-600 transition-all">
            <CalendarIcon className="text-slate-400 w-5 h-5" />
            <input 
              type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)}
              className="bg-transparent text-slate-900 focus:outline-none font-medium cursor-pointer"
              title="Escolha a data do mapa"
            />
          </div>
          
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md cursor-pointer"
            title={isFullscreen ? "Sair do modo tela cheia" : "Modo TV / Tela Cheia"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            <span className="hidden sm:inline">{isFullscreen ? "Minimizar" : "Modo TV"}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600 my-6">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neutral-500"></div> Fila de Espera</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Agendado</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div> Em Preparo</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Em Andamento</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Em Limpeza</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Finalizado</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600"></div> Cancelado</span>
        <span className="flex items-center gap-2 border-l border-slate-200 pl-4"><div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div> Emergência</span>
      </div>

      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto relative cursor-grab active:cursor-grabbing ${isFullscreen ? 'h-[calc(100vh-230px)]' : 'min-h-125'}`}>
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 text-blue-600">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="font-bold text-sm">Sincronizando posições...</p>
          </div>
        )}

        <div className="min-w-500 pt-24 px-6 pb-16">
          <div className="flex border-b border-slate-200 pb-2 mb-4 ml-28 relative">
            {HORAS_DIA.map((hora) => (
              <div key={hora} className="flex-1 text-xs font-bold text-slate-400 text-left relative">
                <span className="absolute -left-3 bg-white px-1 z-10">{hora.toString().padStart(2, '0')}:00</span>
                <div className={`absolute left-0 top-6 w-px bg-slate-100 z-0 ${isFullscreen ? 'h-250' : 'h-150'}`}></div>
              </div>
            ))}
          </div>

          <div className="space-y-6 relative z-10">
            {salas.length === 0 && !isLoading && (
              <div className="text-center py-10 text-slate-500">Nenhuma sala cirúrgica operante encontrada.</div>
            )}
            
            {salas.map((sala) => (
              <div key={sala.id} className="flex items-center gap-4 relative h-16">
                
                <div className="w-24 shrink-0 flex flex-col justify-center">
                  <span className="font-bold text-slate-700 text-sm leading-tight">{sala.nomeNumero}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{sala.tipoSala?.replace('SALA_', '')}</span>
                </div>
                
                <div className="flex-1 h-full bg-slate-50/50 rounded-xl relative border border-slate-100 flex">
                  {HORAS_DIA.map((hora) => (
                    <div 
                      key={hora} 
                      className={`flex-1 h-full transition-colors ${isDragging ? 'border-l border-dashed border-blue-200 hover:bg-blue-50/50' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, sala.id, hora)}
                    />
                  ))}

                  {cirurgias
                    .filter((c: any) => String(c.sala?.id || c.salaId) === String(sala.id))
                    .map((cirurgia) => {
                      const pos = calcularPosicaoGantt(cirurgia.inicioPrevisto, cirurgia.fimPrevisto);
                      const isBloqueada = cirurgia.statusAtual === "FINALIZADO" || cirurgia.statusAtual === "CANCELADO";

                      return (
                        <motion.div 
                          key={cirurgia.id}
                          layout
                          draggable={!isBloqueada}
                          onDragStart={(e: any) => handleDragStart(e, cirurgia)}
                          onDragEnd={handleDragEnd}
                          className={`absolute top-1/2 -translate-y-1/2 h-10 rounded-lg border shadow-sm flex items-center px-3 group transition-all ${getCorBarra(cirurgia.statusAtual, cirurgia.prioridade)} ${isBloqueada ? 'cursor-not-allowed opacity-70' : 'cursor-grab active:cursor-grabbing hover:brightness-110 hover:z-20'}`}
                          style={{ left: pos.left, width: pos.width }}
                        >
                          <span className={`text-xs font-bold truncate ${cirurgia.statusAtual === 'EM_PREPARO' && cirurgia.prioridade !== 'EMERGENCIA' ? 'text-amber-900' : ''}`}>
                            {cirurgia.pacienteNome || cirurgia.paciente?.nome || "Paciente"}
                          </span>
                          
                          <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-50 pointer-events-none">
                            <p className="font-bold text-sm mb-1">{cirurgia.pacienteNome || cirurgia.paciente?.nome}</p>
                            <div className="space-y-1 text-xs text-slate-300">
                              <p className="flex items-center gap-2"><Clock size={12}/> {new Date(formatarIsoSeguro(cirurgia.inicioPrevisto)).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} às {new Date(formatarIsoSeguro(cirurgia.fimPrevisto)).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                              <p className="flex items-center gap-2"><Activity size={12}/> {cirurgia.statusAtual.replace('_', ' ')}</p>
                              <p className="flex items-center gap-2"><AlertCircle size={12}/> Prioridade: {cirurgia.prioridade}</p>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </motion.div>
                      );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}