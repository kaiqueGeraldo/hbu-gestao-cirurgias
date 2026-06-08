"use client";

import GenericCrudScreen from "@/app/src/components/ui/genericCrudScreen";
import { useToast } from "@/app/src/contexts/toastContext";
import {
  createProfissional,
  getProfissionais,
  inativarProfissional,
  updateProfissional
} from "@/app/src/services/profissionalService";
import { useCallback, useEffect, useState } from "react";

export default function ProfissionaisScreen() {
  const { addToast } = useToast();
  const [profissionais, setProfissionais] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfissionais = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProfissionais();
      // Garante que a lista não quebre se o backend retornar vazio
      setProfissionais(res.data || []);
    } catch (error: any) {
      addToast(error.message || "Erro ao carregar a lista de profissionais.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadProfissionais();
  }, [loadProfissionais]);

  const handleSave = async (data: any) => {
    try {
      if (data.id) {
        // Fluxo de Edição (PATCH)
        await updateProfissional(data.id, {
          nomeCompleto: data.nomeCompleto,
          crmCoren: data.crmCoren,
          especialidade: data.especialidade
        });
        addToast("Profissional atualizado com sucesso!", "success");
      } else {
        // Fluxo de Criação (POST)
        await createProfissional({
          nomeCompleto: data.nomeCompleto,
          crmCoren: data.crmCoren,
          especialidade: data.especialidade
        });
        addToast("Profissional cadastrado com sucesso!", "success");
      }
      // Recarrega a tabela com os dados atualizados do banco
      loadProfissionais();
    } catch (error: any) {
      addToast(error.message || "Erro ao salvar os dados do profissional.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente inativar este profissional? Ele perderá acesso as escalas cirúrgicas.")) {
      try {
        await inativarProfissional(id);
        addToast("Profissional inativado com sucesso.", "success");
        loadProfissionais();
      } catch (error: any) {
        addToast(error.message || "Erro ao inativar o profissional.", "error");
      }
    }
  };

  return (
    <GenericCrudScreen
      title="Corpo Clínico"
      subtitle="Gerencie os profissionais que atuam no centro cirúrgico"
      isLoading={isLoading}
      columns={[
        { key: "nomeCompleto", label: "Nome do Profissional" },
        { key: "crmCoren", label: "Registro (CRM/Coren)" },
        { 
          key: "especialidade", 
          label: "Especialidade",
          render: (val) => val ? String(val).replace("_", " ") : "Geral"
        }
      ]}
      formFields={[
        { name: "nomeCompleto", label: "Nome Completo", type: "text", placeholder: "Dr. João Silva" },
        { name: "crmCoren", label: "Registro Profissional", type: "text", placeholder: "Ex: CRM 00000/SP" },
        { name: "especialidade", label: "Especialidade", type: "select", options: [
          { label: "Cirurgia Geral", value: "CIRURGIA_GERAL" },
          { label: "Anestesiologia", value: "ANESTESIOLOGIA" },
          { label: "Ortopedia", value: "ORTOPEDIA" },
          { label: "Enfermagem", value: "ENFERMAGEM" }
        ]}
      ]}
      data={profissionais}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}