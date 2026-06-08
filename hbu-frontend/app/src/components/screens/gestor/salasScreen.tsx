"use client";

import GenericCrudScreen from "@/app/src/components/ui/genericCrudScreen";
import { useToast } from "@/app/src/contexts/toastContext";
import { createSala, getSalas, inativarSala, updateSala } from "@/app/src/services/salaService";
import { useCallback, useEffect, useState } from "react";

export default function SalasScreen() {
  const { addToast } = useToast();
  const [salas, setSalas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSalas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSalas();
      setSalas(res.data);
    } catch (error: any) {
      addToast(error.message || "Erro ao carregar salas do servidor.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadSalas();
  }, [loadSalas]);

  const handleSave = async (data: any) => {
    try {
      if (data.id) {
        // PATCH: Enviando as chaves exatas do Backend
        await updateSala(data.id, { 
          nomeNumero: data.nomeNumero, 
          statusOperacional: data.statusOperacional 
        });
        addToast("Sala atualizada com sucesso!", "success");
      } else {
        // POST: Enviando as chaves exatas do DTO (SalaCirurgicaRequestDTO)
        await createSala({ 
          nomeNumero: data.nomeNumero, 
          tipoSala: data.tipoSala, 
          statusOperacional: data.statusOperacional || "DISPONIVEL" // Usando o default do seu Java
        });
        addToast("Sala criada com sucesso!", "success");
      }
      loadSalas();
    } catch (error: any) {
      addToast(error.message || "Erro ao salvar os dados da sala.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Deseja realmente inativar/remover esta sala?")) {
      try {
        await inativarSala(id);
        addToast("Sala inativada com sucesso.", "success");
        loadSalas();
      } catch (error: any) {
        addToast(error.message || "Erro ao inativar a sala.", "error");
      }
    }
  };

  return (
    <GenericCrudScreen
      title="Gestão de Salas"
      subtitle="Cadastre e gerencie a infraestrutura física do bloco cirúrgico"
      isLoading={isLoading}
      columns={[
        { key: "nomeNumero", label: "Nome da Sala" }, 
        { 
          key: "tipoSala",
          label: "Tipo",
          render: (val) => val ? String(val).replace("SALA_", "").replace("_", " ") : ""
        },
        { 
          key: "statusOperacional",
          label: "Status", 
          render: (val) => {
            const isAtiva = val !== 'INATIVA' && val !== 'EM_MANUTENCAO';
            return (
              <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                isAtiva ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}>
                {val}
              </span>
            );
          } 
        }
      ]}
      formFields={[
        { name: "nomeNumero", label: "Nome / Identificação", type: "text", placeholder: "Ex: Sala 01" },
        { 
          name: "tipoSala",
          label: "Tipo de Sala", 
          type: "select", 
          options: [
            { label: "Padrão", value: "SALA_PADRAO" },
            { label: "Alta Complexidade", value: "SALA_ALTA_COMPLEXIDADE" },
            { label: "Parto", value: "SALA_PARTO" },
            { label: "Emergência", value: "SALA_EMERGENCIA" }
          ] 
        },
        { 
          name: "statusOperacional",
          label: "Status Operacional", 
          type: "select", 
          options: [
            { label: "Disponível", value: "DISPONIVEL" },
            { label: "Em Manutenção", value: "EM_MANUTENCAO" },
            { label: "Inativa", value: "INATIVA" }
          ] 
        }
      ]}
      data={salas}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}