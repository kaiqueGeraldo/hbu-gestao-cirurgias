"use client";

import { useToast } from "@/app/src/contexts/toastContext";
import { alocarMembro, getEquipeCirurgia, substituirMembro } from "@/app/src/services/cirurgiaEquipeService";
import { getCirurgias } from "@/app/src/services/cirurgiaService";
import { getProfissionais } from "@/app/src/services/profissionalService";
import { CirurgiaResponseDTO } from "@/app/src/types/cirurgia";
import { MembroEquipeResponseDTO, PapelEquipe } from "@/app/src/types/cirurgiaEquipe";
import { ProfissionalResponseDTO } from "@/app/src/types/profissional";
import { AlertTriangle, CheckCircle, Loader2, Plus, RefreshCw, Save, Users, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

const SLOTS_ESPERADOS = [
  { papel: "CIRURGIAO_PRINCIPAL" as PapelEquipe, label: "Cirurgião Principal", obrigatorio: true },
  { papel: "ANESTESISTA" as PapelEquipe, label: "Anestesista", obrigatorio: true },
  { papel: "CIRURGIAO_AUXILIAR" as PapelEquipe, label: "Cirurgião Auxiliar", obrigatorio: false },
  { papel: "INSTRUMENTADOR" as PapelEquipe, label: "Instrumentador", obrigatorio: false },
  { papel: "ENFERMEIRO_CIRCULANTE" as PapelEquipe, label: "Enf. Circulante", obrigatorio: false },
];

export default function AlocacaoEquipesScreen() {
  const { addToast } = useToast();
  
  const [cirurgias, setCirurgias] = useState<CirurgiaResponseDTO[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalResponseDTO[]>([]);
  const [equipeAtual, setEquipeAtual] = useState<MembroEquipeResponseDTO[]>([]);
  
  const [cirurgiaSelecionada, setCirurgiaSelecionada] = useState<CirurgiaResponseDTO | null>(null);
  const [isLoadingCirurgias, setIsLoadingCirurgias] = useState(true);
  const [isLoadingEquipe, setIsLoadingEquipe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalAlocar, setModalAlocar] = useState<{ isOpen: boolean; papel: PapelEquipe | null }>({ isOpen: false, papel: null });
  const [modalSubstituir, setModalSubstituir] = useState<{ isOpen: boolean; alocacaoId: string | null; papel: PapelEquipe | null }>({ isOpen: false, alocacaoId: null, papel: null });
  
  const [profissionalIdSelecionado, setProfissionalIdSelecionado] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    const carregarBase = async () => {
      try {
        const [resCirurgias, resProfissionais] = await Promise.all([getCirurgias(), getProfissionais()]);
        const ativas = (resCirurgias.data || []).filter((c: any) => c.statusAtual !== 'CANCELADO' && c.statusAtual !== 'FINALIZADO');
        setCirurgias(ativas);
        setProfissionais(resProfissionais.data || []);
      } catch (error) {
        addToast("Erro ao carregar dados da base.", "error");
      } finally {
        setIsLoadingCirurgias(false);
      }
    };
    carregarBase();
  }, [addToast]);

  const carregarEquipe = useCallback(async (cirurgiaId: string | number) => {
    setIsLoadingEquipe(true);
    try {
      const res = await getEquipeCirurgia(cirurgiaId);
      setEquipeAtual(res.data || []);
    } catch (error) {
      addToast("Erro ao carregar a equipe desta cirurgia.", "error");
      setEquipeAtual([]);
    } finally {
      setIsLoadingEquipe(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (cirurgiaSelecionada) {
      carregarEquipe(cirurgiaSelecionada.id);
    }
  }, [cirurgiaSelecionada, carregarEquipe]);

  const handleAlocar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cirurgiaSelecionada || !modalAlocar.papel) return;
    
    setIsSubmitting(true);
    try {
      await alocarMembro(cirurgiaSelecionada.id, {
        profissionalId: profissionalIdSelecionado,
        papel: modalAlocar.papel
      });
      addToast("Profissional alocado com sucesso!", "success");
      setModalAlocar({ isOpen: false, papel: null });
      setProfissionalIdSelecionado("");
      carregarEquipe(cirurgiaSelecionada.id);
    } catch (error: any) {
      addToast(error.message || "Erro ao alocar profissional.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubstituir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSubstituir.alocacaoId) return;

    setIsSubmitting(true);
    try {
      await substituirMembro(modalSubstituir.alocacaoId, {
        membroAtualId: modalSubstituir.alocacaoId,
        novoProfissionalId: profissionalIdSelecionado,
        motivoRemocao: motivo
      });
      addToast("Substituição realizada com sucesso!", "success");
      setModalSubstituir({ isOpen: false, alocacaoId: null, papel: null });
      setProfissionalIdSelecionado("");
      setMotivo("");
      carregarEquipe(cirurgiaSelecionada!.id);
    } catch (error: any) {
      addToast(error.message || "Erro ao substituir profissional.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatarHora = (isoStr: string) => {
    if (!isoStr) return "--:--";
    return new Date(isoStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Escala de Equipes</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie a alocação de profissionais e substituições para as cirurgias ativas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        
        {/* Painel Esquerdo: Lista de Cirurgias */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Cirurgias Pendentes/Ativas</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoadingCirurgias ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : cirurgias.length === 0 ? (
              <p className="text-center text-slate-400 text-sm p-4">Nenhuma cirurgia ativa.</p>
            ) : (
              cirurgias.map(cirurgia => {
                const isSelected = cirurgiaSelecionada?.id === cirurgia.id;
                // Exibição segura de nomes baseada no seu DTO de Cirurgia
                const nomePaciente = cirurgia.pacienteNome || cirurgia.paciente?.nome || "Paciente N/A";
                const nomeSala = cirurgia.salaNomeNumero || cirurgia.sala?.nomeNumero || "Sala N/A";

                return (
                  <button
                    key={cirurgia.id}
                    onClick={() => setCirurgiaSelecionada(cirurgia)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected ? "border-blue-600 bg-blue-50/50 shadow-sm" : "border-slate-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-900 line-clamp-1">{nomePaciente}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>{nomeSala}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{formatarHora(cirurgia.inicioPrevisto)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Slots de Alocação */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {cirurgiaSelecionada ? (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Mapeamento da Equipe</h2>
                  <p className="text-sm text-slate-500 mt-1">Status da Cirurgia: <strong className="text-blue-600">{cirurgiaSelecionada.statusAtual}</strong></p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingEquipe ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400">
                     <Loader2 className="animate-spin w-8 h-8 mb-2" />
                     <p>Carregando escala...</p>
                   </div>
                ) : (
                  SLOTS_ESPERADOS.map((slot, index) => {
                    // Cruza o slot esperado com o dado real vindo da API
                    const alocacao = equipeAtual.find(e => e.papel === slot.papel);

                    return (
                      <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900">{slot.label}</h3>
                            {slot.obrigatorio && <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">Obrigatório</span>}
                          </div>
                          
                          {alocacao ? (
                            <p className="text-sm text-emerald-700 font-bold flex items-center gap-2">
                              <CheckCircle size={16} /> {alocacao.nomeProfissional} <span className="font-normal text-xs text-emerald-600/70">({alocacao.crmCoren})</span>
                            </p>
                          ) : (
                            <p className="text-sm text-amber-600 font-medium flex items-center gap-2">
                              <AlertTriangle size={16} /> Vaga Pendente
                            </p>
                          )}
                        </div>

                        <div className="w-full sm:w-auto flex gap-2 shrink-0">
                          {alocacao ? (
                            <button 
                              onClick={() => setModalSubstituir({ isOpen: true, alocacaoId: alocacao.idAlocacao, papel: slot.papel })}
                              className="w-full sm:w-auto px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                              <RefreshCw size={14} /> Substituir
                            </button>
                          ) : (
                            <button 
                              onClick={() => setModalAlocar({ isOpen: true, papel: slot.papel })}
                              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                              <Plus size={16} /> Alocar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Users size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Selecione uma cirurgia na lista lateral para gerenciar a equipe escalada.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ALOCAR MEMBRO */}
      {modalAlocar.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Alocar Profissional</h2>
                <p className="text-sm text-slate-500 mt-1">Cargo: {SLOTS_ESPERADOS.find(s => s.papel === modalAlocar.papel)?.label}</p>
              </div>
              <button onClick={() => setModalAlocar({ isOpen: false, papel: null })} className="text-slate-400 hover:text-slate-600 cursor-pointer p-2"><X size={20} /></button>
            </div>
            <form onSubmit={handleAlocar} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Selecione o Profissional</label>
                <select 
                  required value={profissionalIdSelecionado} onChange={(e) => setProfissionalIdSelecionado(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="" disabled>Selecione...</option>
                  {profissionais.map(p => (
                    // CORREÇÃO: Utilizando p.nomeCompleto conforme o DTO do backend
                    <option key={p.id} value={p.id}>{p.nomeCompleto} ({p.especialidade?.replace('_', ' ') || 'Geral'})</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70">
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save size={18} /> Confirmar Alocação</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBSTITUIR MEMBRO */}
      {modalSubstituir.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Substituir Profissional</h2>
                <p className="text-sm text-slate-500 mt-1">Cargo: {SLOTS_ESPERADOS.find(s => s.papel === modalSubstituir.papel)?.label}</p>
              </div>
              <button onClick={() => setModalSubstituir({ isOpen: false, alocacaoId: null, papel: null })} className="text-slate-400 hover:text-slate-600 cursor-pointer p-2"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubstituir} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Novo Profissional</label>
                <select 
                  required value={profissionalIdSelecionado} onChange={(e) => setProfissionalIdSelecionado(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-rose-600 font-medium"
                >
                  <option value="" disabled>Selecione o substituto...</option>
                  {profissionais.map(p => (
                    // CORREÇÃO: Utilizando p.nomeCompleto
                    <option key={p.id} value={p.id}>{p.nomeCompleto}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                  Motivo da Substituição (Auditoria) <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  required rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Justifique a quebra de escala (Ex: Atraso, Atestado, etc)"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-rose-600 resize-none"
                />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70">
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><RefreshCw size={18} /> Confirmar Troca</>}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}