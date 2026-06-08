"use client";

import { useAuthContext } from "@/app/src/contexts/authContext";
import { useToast } from "@/app/src/contexts/toastContext";
import { getCirurgias } from "@/app/src/services/cirurgiaService";
import { getSalas } from "@/app/src/services/salaService";
import { CirurgiaResponseDTO } from "@/app/src/types/cirurgia";
import { Activity, Bed, Calendar, Loader2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function DashboardRecepcaoScreen() {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  
  const [cirurgiasHoje, setCirurgiasHoje] = useState<CirurgiaResponseDTO[]>([]);
  const [metricas, setMetricas] = useState({
    totalAgendadas: 0,
    emAndamento: 0,
    filaEspera: 0,
    salasLivres: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const carregarDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const [resCirurgias, resSalas] = await Promise.all([getCirurgias(), getSalas()]);
      
      const dadosCirurgias = Array.isArray(resCirurgias.data) ? resCirurgias.data : resCirurgias.data.content || [];
      const salasCadastradas = resSalas.data || [];

      // Filtra cirurgias apenas para o dia de hoje
      const listaHoje = dadosCirurgias.filter((c: any) => c.inicioPrevisto && c.inicioPrevisto.startsWith(hoje));
      
      // Ordena pelas mais recentes
      listaHoje.sort((a: any, b: any) => new Date(a.inicioPrevisto).getTime() - new Date(b.inicioPrevisto).getTime());
      
      setCirurgiasHoje(listaHoje);

      // Calcula Métricas
      const totalAgendadas = listaHoje.length;
      const emAndamento = listaHoje.filter((c: any) => c.statusAtual === "EM_ANDAMENTO" || c.statusAtual === "EM_PREPARO").length;
      const filaEspera = listaHoje.filter((c: any) => c.statusAtual === "AGENDADO" || c.statusAtual === "FILA_ESPERA").length;
      
      // Salas Livres: Total de salas operacionais - cirurgias em andamento neste exato momento
      const totalSalasOperacionais = salasCadastradas.filter((s: any) => s.statusOperacional === "DISPONIVEL").length;
      const salasOcupadasHoje = new Set(listaHoje.filter((c: any) => c.statusAtual === "EM_ANDAMENTO" || c.statusAtual === "EM_PREPARO" || c.statusAtual === "EM_LIMPEZA").map((c: any) => c.salaId)).size;
      const salasLivres = Math.max(0, totalSalasOperacionais - salasOcupadasHoje);

      setMetricas({
        totalAgendadas,
        emAndamento,
        filaEspera,
        salasLivres
      });

    } catch (error) {
      addToast("Erro ao sincronizar os dados do painel da recepção.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    carregarDashboard();
    // Atualização em background a cada 60 segundos
    const interval = setInterval(carregarDashboard, 60000);
    return () => clearInterval(interval);
  }, [carregarDashboard]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FILA_ESPERA": return "bg-neutral-500 text-white";
      case "AGENDADO": return "bg-blue-100 text-blue-700";
      case "EM_PREPARO": return "bg-amber-100 text-amber-700";
      case "EM_ANDAMENTO": return "bg-purple-100 text-purple-700";
      case "EM_LIMPEZA": return "bg-green-100 text-green-700";
      case "FINALIZADO": return "bg-slate-200 text-slate-700";
      case "CANCELADO": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case "ELETIVA": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "URGENCIA": return "text-amber-600 bg-amber-50 border-amber-200";
      case "EMERGENCIA": return "text-rose-600 bg-rose-50 border-rose-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const formatarHora = (isoString: string) => {
    if (!isoString) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel Operacional</h1>
          <p className="text-slate-500 text-sm mt-1">Visão em tempo real da recepção do centro cirúrgico</p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={carregarDashboard} className="text-slate-400 hover:text-blue-600 transition-colors text-sm font-bold flex items-center gap-2 cursor-pointer">
            Atualizar Agora {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user?.sub?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-900">{user?.sub?.split('@')[0] || "Usuário"}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('ROLE_', '').toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-sm font-medium">Cirurgias Hoje</p>
            <Calendar className="text-blue-500 w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{isLoading ? "-" : metricas.totalAgendadas}</h3>
          <p className="text-xs text-slate-400 mt-1">Procedimentos listados</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-sm font-medium">Fluxo Ativo</p>
            <Activity className="text-emerald-500 w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{isLoading ? "-" : metricas.emAndamento}</h3>
          <p className="text-xs text-slate-400 mt-1">Sendo preparadas ou operadas</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-sm font-medium">Aguardando</p>
            <Users className="text-purple-500 w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{isLoading ? "-" : metricas.filaEspera}</h3>
          <p className="text-xs text-slate-400 mt-1">Pacientes agendados</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-sm font-medium">Salas Livres</p>
            <Bed className="text-amber-500 w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{isLoading ? "-" : metricas.salasLivres}</h3>
          <p className="text-xs text-slate-400 mt-1">Físico liberado no momento</p>
        </div>
      </div>

      {/* Tabela Viva */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Cronograma do Dia</h2>
        </div>
        <div className="overflow-x-auto min-h-60 relative">
          {isLoading && cirurgiasHoje.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 text-slate-500">
               <Loader2 className="w-6 h-6 animate-spin mb-2" /> Carregando mapa...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Horário</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sala</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Prioridade</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cirurgiasHoje.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-500 font-medium">Nenhum procedimento agendado para o dia de hoje.</td></tr>
                ) : (
                  cirurgiasHoje.map((cirurgia) => (
                    <tr key={cirurgia.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-black text-slate-900 whitespace-nowrap">{formatarHora(cirurgia.inicioPrevisto)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 whitespace-nowrap">{cirurgia.pacienteNome || cirurgia.paciente?.nome || "Paciente"}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{cirurgia.salaNomeNumero || cirurgia.sala?.nomeNumero || "A Definir"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getPriorityColor(cirurgia.prioridade)}`}>
                          {cirurgia.prioridade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusColor(cirurgia.statusAtual)}`}>
                          {cirurgia.statusAtual.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}