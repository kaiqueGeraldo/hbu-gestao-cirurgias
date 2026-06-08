// src/components/screens/recepcao/PacientesScreen.tsx
"use client";

import { ApiError } from "@/app/src/services/api";
import { deletePaciente, getPacientes } from "@/app/src/services/pacienteService";
import { PacienteResponseDTO } from "@/app/src/types/paciente";
import { maskCPF } from "@/app/src/utils/masks";
import { AlertCircle, Edit2, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PacienteSideModal from "./pacienteSideModal";

export default function PacientesScreen() {
  const [busca, setBusca] = useState("");
  const [pacientes, setPacientes] = useState<PacienteResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pacienteEmEdicao, setPacienteEmEdicao] = useState<PacienteResponseDTO | null>(null);

  const fetchPacientes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPacientes();
      // O Spring Boot devolve response.data como um Array (ou Page dependendo da sua config)
      // Se for paginação do Spring (Page<Paciente>), mude para response.data.content
      setPacientes(response.data); 
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar pacientes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const handleOpenModal = (paciente?: PacienteResponseDTO) => {
    setPacienteEmEdicao(paciente || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = (foiSalvo: boolean) => {
    setIsModalOpen(false);
    if (foiSalvo) {
      fetchPacientes();
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja inativar o prontuário de ${nome}?`)) {
      try {
        await deletePaciente(id);
        fetchPacientes();
      } catch (err: any) {
        alert(err.message || "Erro ao inativar paciente");
      }
    }
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || p.cpf.includes(busca)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie o prontuário e cadastro dos pacientes</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={20} /> Novo Paciente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-3 text-red-700 font-medium">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="overflow-x-auto min-h-75 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-bold">Carregando base do hospital...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nome Completo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">CPF</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data Nasc.</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pacientesFiltrados.length === 0 && !isLoading && !error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500 font-medium">Nenhum paciente encontrado.</td>
                  </tr>
                ) : (
                  pacientesFiltrados.map((paciente) => (
                    <tr key={paciente.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{paciente.nome}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{maskCPF(paciente.cpf)}</td>
                      {/* Tratando a data caso o Java devolva YYYY-MM-DD */}
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {paciente.dataNascimento.split('-').reverse().join('/')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(paciente)}
                            className="p-2 text-slate-400 hover:text-blue-600 bg-white rounded-lg border border-slate-200 transition-all cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(paciente.id, paciente.nome)}
                            className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-lg border border-slate-200 transition-all cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PacienteSideModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        paciente={pacienteEmEdicao} 
      />
    </div>
  );
}