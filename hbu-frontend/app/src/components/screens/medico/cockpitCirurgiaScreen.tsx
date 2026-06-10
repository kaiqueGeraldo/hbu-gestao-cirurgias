"use client";

import { useAuthContext } from "@/app/src/contexts/authContext";
import { useToast } from "@/app/src/contexts/toastContext";
import { getEquipeCirurgia } from "@/app/src/services/cirurgiaEquipeService";
import { atualizarStatusCirurgia, finalizarCirurgia, getCirurgiaById } from "@/app/src/services/cirurgiaService";
import { getProcedimentosDaCirurgia, getTodosProcedimentos, sincronizarProcedimentos } from "@/app/src/services/procedimentoService";
import { CirurgiaResponseDTO } from "@/app/src/types/cirurgia";
import { Activity, AlertCircle, ArrowLeft, Check, CheckCircle2, Clock, Loader2, Play, Plus, Save, Search, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

export default function CockpitCirurgiaScreen() {
  const router = useRouter();
  const params = useParams();
  const cirurgiaId = params.id as string;
  const { user } = useAuthContext();
  const { addToast } = useToast();
  
  // Estados de Dados
  const [cirurgia, setCirurgia] = useState<CirurgiaResponseDTO | null>(null);
  const [catalogoTuss, setCatalogoTuss] = useState<any[]>([]);
  const [procedimentosRealizados, setProcedimentosRealizados] = useState<any[]>([]);
  const [equipeEscalada, setEquipeEscalada] = useState<any[]>([]);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [buscaTuss, setBuscaTuss] = useState("");
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [isEvoluindoStatus, setIsEvoluindoStatus] = useState(false);

  // Estados do Modal
  const [horaInicioReal, setHoraInicioReal] = useState("");
  const [horaFimReal, setHoraFimReal] = useState("");

  const carregarCockpit = useCallback(async () => {
    try {
      const [resCirurgia, resTuss, resProcAtuais, resEquipe] = await Promise.all([
        getCirurgiaById(cirurgiaId),
        getTodosProcedimentos(),
        getProcedimentosDaCirurgia(cirurgiaId),
        getEquipeCirurgia(cirurgiaId) // Novo fetch
      ]);
      setCirurgia(resCirurgia.data);
      setCatalogoTuss(resTuss.data || []);
      setProcedimentosRealizados(resProcAtuais.data || []);
      setEquipeEscalada(resEquipe.data || []);
    } catch (error) {
      addToast("Erro ao carregar dados do prontuário.", "error");
      router.push("/medico/agenda");
    } finally {
      setIsLoading(false);
    }
  }, [cirurgiaId, addToast, router]);

  useEffect(() => {
    carregarCockpit();
  }, [carregarCockpit]);

  // MÁQUINA DE ESTADOS DA CIRURGIA
  const evoluirStatus = async () => {
    if (!cirurgia || !user) return;
    
    if (cirurgia.statusAtual === "AGENDADO") {
      const temCirurgiao = equipeEscalada.some((e: any) => e.papel === "CIRURGIAO_PRINCIPAL");
      const temAnestesista = equipeEscalada.some((e: any) => e.papel === "ANESTESISTA");
      
      if (!temCirurgiao || !temAnestesista) {
        addToast("Ação bloqueada. É necessário que o Gestor aloque o Cirurgião Principal e o Anestesista antes de iniciar a cirurgia.", "error");
        return;
      }
    }

    let novoStatus = "";
    if (cirurgia.statusAtual === "AGENDADO") novoStatus = "EM_PREPARO";
    else if (cirurgia.statusAtual === "EM_PREPARO") novoStatus = "EM_ANDAMENTO";
    else if (cirurgia.statusAtual === "EM_ANDAMENTO") {
      setIsFinalizando(true); 
      return;
    }

    setIsEvoluindoStatus(true);
    try {
      await atualizarStatusCirurgia(cirurgiaId, novoStatus, user.sub);
      addToast(`Status evoluído para ${novoStatus.replace("_", " ")}`, "success");
      carregarCockpit(); 
    } catch (error: any) {
      addToast(error.message || "Erro ao evoluir status.", "error");
    } finally {
      setIsEvoluindoStatus(false);
    }
  };

  const adicionarTuss = (tussItem: any) => {
    const jaExiste = procedimentosRealizados.find(p => p.procedimentoId === tussItem.id);
    if (!jaExiste) {
      const novoProcedimento = {
        procedimentoId: tussItem.id,
        codigoTuss: tussItem.codigoTuss,
        descricao: tussItem.descricao,
        isPrincipal: procedimentosRealizados.length === 0
      };
      setProcedimentosRealizados([...procedimentosRealizados, novoProcedimento]);
    }
  };

  const removerTuss = (procedimentoId: string) => {
    setProcedimentosRealizados(procedimentosRealizados.filter(p => p.procedimentoId !== procedimentoId));
  };

  const setPrincipal = (procedimentoId: string) => {
    setProcedimentosRealizados(procedimentosRealizados.map(p => ({
      ...p,
      isPrincipal: p.procedimentoId === procedimentoId
    })));
  };

  const salvarProcedimentos = async () => {
    const temPrincipal = procedimentosRealizados.some(p => p.isPrincipal);
    if (procedimentosRealizados.length > 0 && !temPrincipal) {
      addToast("Selecione qual procedimento é o PRINCIPAL antes de salvar.", "warning");
      return;
    }

    setIsSyncing(true);
    try {
      const payload = procedimentosRealizados.map(p => ({ procedimentoId: p.procedimentoId, isPrincipal: p.isPrincipal }));
      await sincronizarProcedimentos(cirurgiaId, payload);
      addToast("Procedimentos sincronizados! O tempo da sala foi recalculado.", "success");
    } catch (error: any) {
      addToast(error.message || "Erro ao salvar TUSS.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // ENCERRAMENTO
  const confirmarEncerramento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedimentosRealizados.some(p => p.isPrincipal)) {
      addToast("Auditoria: Não é possível encerrar sem lançar o procedimento TUSS principal.", "error");
      return;
    }

    setIsEvoluindoStatus(true);
    try {
      // Monta o ZonedDateTime com a data atual (simplificado para o MVP)
      const dataHoje = new Date().toISOString().split('T')[0];
      const inicioRealIso = `${dataHoje}T${horaInicioReal}:00-03:00`;
      const fimRealIso = `${dataHoje}T${horaFimReal}:00-03:00`;

      await finalizarCirurgia(cirurgiaId, inicioRealIso, fimRealIso);
      addToast("Prontuário travado e cirurgia finalizada com sucesso.", "success");
      setIsFinalizando(false);
      carregarCockpit();
    } catch (error: any) {
      addToast(error.message || "Erro ao finalizar cirurgia.", "error");
    } finally {
      setIsEvoluindoStatus(false);
    }
  };

  if (isLoading || !cirurgia) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;
  }

  const tussFiltrado = catalogoTuss.filter(t => 
    t.descricao.toLowerCase().includes(buscaTuss.toLowerCase()) || 
    t.codigoTuss.includes(buscaTuss)
  );

  const isLocked = cirurgia.statusAtual === "FINALIZADO" || cirurgia.statusAtual === "CANCELADO";

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative pb-10">
      
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium cursor-pointer">
        <ArrowLeft size={18} /> Voltar para Agenda
      </button>

      {/* HEADER DO COCKPIT */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isLocked ? 'bg-slate-700 text-slate-300' : 'bg-blue-600 text-white'}`}>
                {cirurgia.statusAtual.replace("_", " ")}
              </span>
              <span className="text-slate-400 text-sm font-medium">Ticket #{cirurgia.id.split('-')[0]}</span>
            </div>
            <h1 className="text-3xl font-bold">Acesso Médico Concedido</h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Activity size={16} /> Paciente aguardando no Centro Cirúrgico
            </p>
          </div>

          {!isLocked && (
            <button 
              onClick={evoluirStatus}
              disabled={isEvoluindoStatus}
              className={`py-4 px-8 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-lg cursor-pointer disabled:opacity-70 ${
                cirurgia.statusAtual === "AGENDADO" ? "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/20" :
                cirurgia.statusAtual === "EM_PREPARO" ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20" :
                "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20"
              }`}
            >
              {isEvoluindoStatus ? <Loader2 className="animate-spin w-6 h-6" /> : (
                <>
                  {cirurgia.statusAtual === "AGENDADO" && <><Clock size={24} /> Iniciar Preparo</>}
                  {cirurgia.statusAtual === "EM_PREPARO" && <><Play size={24} /> Iniciar Cirurgia</>}
                  {cirurgia.statusAtual === "EM_ANDAMENTO" && <><CheckCircle2 size={24} /> Finalizar Cirurgia</>}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* PAINEL TUSS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-150">
        
        {/* BUSCA (Esquerda) */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Search size={18} className="text-slate-400" /> Catálogo TUSS</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" placeholder="Buscar código ou descrição..." value={buscaTuss} onChange={(e) => setBuscaTuss(e.target.value)} disabled={isLocked}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:border-blue-600 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {tussFiltrado.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center hover:border-blue-300 transition-colors">
                <div className="pr-4">
                  <p className="text-xs font-bold text-slate-500">{item.codigoTuss} <span className="font-normal">({item.tempoMedioMinutos} min)</span></p>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{item.descricao}</p>
                </div>
                <button 
                  onClick={() => adicionarTuss(item)}
                  disabled={isLocked || !!procedimentosRealizados.find(p => p.procedimentoId === item.id)}
                  className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* REALIZADOS (Direita) */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white z-10">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" /> Realizados
            </h3>
            {!isLocked && (
              <button 
                onClick={salvarProcedimentos} disabled={isSyncing || procedimentosRealizados.length === 0}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1.5 px-4 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSyncing ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save size={14}/> Sincronizar Faturamento</>}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {procedimentosRealizados.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Adicione os procedimentos realizados ao lado.</div>
            ) : (
              procedimentosRealizados.map((item) => (
                <div key={item.procedimentoId} className={`p-4 rounded-xl border ${item.isPrincipal ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200'} transition-all`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500">{item.codigoTuss}</p>
                      <p className="text-sm font-bold text-slate-900 leading-tight mb-3">{item.descricao}</p>
                      {!isLocked && (
                        <label className="flex items-center gap-2 text-sm cursor-pointer group w-fit">
                          <input 
                            type="radio" name="principal" checked={item.isPrincipal} onChange={() => setPrincipal(item.procedimentoId)}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className={`font-medium ${item.isPrincipal ? 'text-blue-700' : 'text-slate-600'}`}>É o Procedimento Principal</span>
                        </label>
                      )}
                    </div>
                    {!isLocked && (
                      <button onClick={() => removerTuss(item.procedimentoId)} className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"><Trash2 size={18} /></button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL FINALIZAR */}
      {isFinalizando && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50"><h2 className="text-xl font-bold text-slate-900">Encerrar Prontuário</h2></div>
            <form onSubmit={confirmarEncerramento} className="p-6 space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-sm font-medium">
                <AlertCircle className="shrink-0 w-5 h-5" />
                <p>O encerramento travará o prontuário. Certifique-se de ter sincronizado o faturamento TUSS.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Início Real</label>
                  <input type="time" required value={horaInicioReal} onChange={(e) => setHoraInicioReal(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 focus:border-blue-600 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Término Real</label>
                  <input type="time" required value={horaFimReal} onChange={(e) => setHoraFimReal(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 focus:border-blue-600 font-bold" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsFinalizando(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 cursor-pointer">Cancelar</button>
                <button type="submit" disabled={isEvoluindoStatus} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                  {isEvoluindoStatus ? <Loader2 className="animate-spin w-5 h-5" /> : <><Check size={18} /> Confirmar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}