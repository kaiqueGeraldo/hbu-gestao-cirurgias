"use client";

import { useToast } from "@/app/src/contexts/toastContext";
import { ApiError } from "@/app/src/services/api";
import { agendarCirurgia } from "@/app/src/services/cirurgiaService";
import { getPacientes } from "@/app/src/services/pacienteService";
import { getSalas } from "@/app/src/services/salaService";
import { PacienteResponseDTO } from "@/app/src/types/paciente";
import { SalaCirurgicaResponseDTO } from "@/app/src/types/sala";
import { maskDate } from "@/app/src/utils/masks";
import { Bed, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Loader2, UserSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AgendamentoScreen() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDados, setIsLoadingDados] = useState(true);
  
  const [pacientes, setPacientes] = useState<PacienteResponseDTO[]>([]);
  const [salas, setSalas] = useState<SalaCirurgicaResponseDTO[]>([]);

  const [formData, setFormData] = useState({
    pacienteId: "",
    salaId: "",
    prioridade: "ELETIVA",
    dataPrevista: "",
    inicioPrevisto: "",
    fimPrevisto: "",
  });

  useEffect(() => {
    const carregarDadosBase = async () => {
      setIsLoadingDados(true);
      try {
        const [pacientesRes, salasRes] = await Promise.all([
          getPacientes(),
          getSalas()
        ]);
        setPacientes(pacientesRes.data);
        setSalas(salasRes.data.filter((s: any) => s.statusOperacional !== "INATIVA"));
      } catch (error) {
        addToast("Erro ao carregar dados do hospital. Tente novamente.", "error");
      } finally {
        setIsLoadingDados(false);
      }
    };
    carregarDadosBase();
  }, [addToast]);

  const nextStep = () => {
    if (step === 1 && !formData.pacienteId) {
      addToast("Selecione um paciente para poder avançar.", "warning");
      return;
    }
    if (step === 2 && (!formData.salaId || !formData.prioridade)) {
      addToast("Preencha as informações da sala e prioridade.", "warning");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.dataPrevista.length !== 10) {
      addToast("Por favor, digite uma data válida e completa (DD/MM/AAAA).", "warning");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const [day, month, year] = formData.dataPrevista.split("/");
      const dataIso = `${year}-${month}-${day}`;

      const inicioFormatado = `${dataIso}T${formData.inicioPrevisto}:00-03:00`;
      const fimFormatado = `${dataIso}T${formData.fimPrevisto}:00-03:00`;

      await agendarCirurgia({
        pacienteId: formData.pacienteId,
        salaId: formData.salaId,
        prioridade: formData.prioridade as "ELETIVA" | "URGENCIA" | "EMERGENCIA",
        inicioPrevisto: inicioFormatado,
        fimPrevisto: fimFormatado,
      });

      addToast("Cirurgia agendada com sucesso!", "success");
      setFormData({
        ...formData,
        pacienteId: "",
        salaId: "",
        dataPrevista: "",
        inicioPrevisto: "",
        fimPrevisto: "",
      });
      setStep(1);
      
    } catch (err: any) {
      if (err instanceof ApiError) {
        addToast(err.message, "error");
      } else {
        addToast("Erro inesperado ao agendar cirurgia.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDados) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-blue-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">Carregando módulos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-slate-900">Agendar Nova Cirurgia</h1>
        <p className="text-slate-500 text-sm mt-1">Siga os passos para registrar um novo procedimento no mapa cirúrgico.</p>
      </div>

      {/* Stepper Visual */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 z-0 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          
          {[
            { num: 1, title: "Paciente", icon: UserSearch },
            { num: 2, title: "Logística", icon: Bed },
            { num: 3, title: "Horário", icon: Clock },
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = step > item.num;
            const isCurrent = step === item.num;
            
            return (
              <div key={item.num} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${
                  isCompleted ? "bg-blue-600 border-white text-white shadow-md" : isCurrent ? "bg-white border-blue-600 text-blue-600 shadow-md" : "bg-white border-slate-200 text-slate-400"
                }`}>
                  {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wide ${isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{item.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-87.5 flex flex-col justify-between">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Seleção de Paciente</h2>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Buscar Paciente Cadastrado</label>
              
              {/* SELECT CUSTOMIZADO */}
              <div className="relative group">
                <select 
                  required
                  value={formData.pacienteId}
                  onChange={(e) => setFormData({...formData, pacienteId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 px-4 pr-10 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="" disabled>Selecione um paciente...</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome} - CPF: {p.cpf}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-600 transition-colors">
                  <ChevronDown size={20} />
                </div>
              </div>

            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Logística Cirúrgica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Sala Cirúrgica</label>
                
                {/* SELECT CUSTOMIZADO */}
                <div className="relative group">
                  <select 
                    required
                    value={formData.salaId}
                    onChange={(e) => setFormData({...formData, salaId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 px-4 pr-10 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="" disabled>Selecione a sala...</option>
                    {salas.map(s => <option key={s.id} value={s.id}>{s.nomeNumero} ({s.tipoSala})</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-600 transition-colors">
                    <ChevronDown size={20} />
                  </div>
                </div>

              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Prioridade</label>
                
                {/* SELECT CUSTOMIZADO */}
                <div className="relative group">
                  <select 
                    required
                    value={formData.prioridade}
                    onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 px-4 pr-10 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="ELETIVA">Eletiva (Agendada previamente)</option>
                    <option value="URGENCIA">Urgência (Intervenção rápida)</option>
                    <option value="EMERGENCIA">Emergência (Risco de vida imediato)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-600 transition-colors">
                    <ChevronDown size={20} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Previsão de Horários</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Data da Cirurgia</label>
                <input 
                  type="text" 
                  required 
                  placeholder="DD/MM/AAAA"
                  value={formData.dataPrevista}
                  onChange={(e) => setFormData({...formData, dataPrevista: maskDate(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-medium tracking-wide"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Início Previsto</label>
                <input 
                  type="time" required value={formData.inicioPrevisto}
                  onChange={(e) => setFormData({...formData, inicioPrevisto: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Fim Previsto</label>
                <input 
                  type="time" required value={formData.fimPrevisto}
                  onChange={(e) => setFormData({...formData, fimPrevisto: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
          <button
            type="button" onClick={prevStep} disabled={step === 1 || isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer'}`}
          >
            <ChevronLeft size={18} /> Voltar
          </button>

          {step < 3 ? (
            <button type="button" onClick={nextStep} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer">
              Continuar <ChevronRight size={18} />
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? "Finalizando..." : "Confirmar Agendamento"} <Check size={18} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}