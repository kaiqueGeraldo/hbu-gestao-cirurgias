"use client";

import GenericCrudScreen from "@/app/src/components/ui/genericCrudScreen";
import { useToast } from "@/app/src/contexts/toastContext";
import {
  createProcedimento,
  getTodosProcedimentos,
  inativarProcedimento,
  updateProcedimento
} from "@/app/src/services/procedimentoService";
import { useCallback, useEffect, useState } from "react";

export default function CatalogoTussScreen() {
  const { addToast } = useToast();
  const [tuss, setTuss] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTuss = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getTodosProcedimentos();
      setTuss(res.data || []);
    } catch (error: any) {
      addToast(error.message || "Erro ao carregar o catálogo TUSS.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadTuss();
  }, [loadTuss]);

  const handleSave = async (data: any) => {
    try {
      const payload = {
        codigoTuss: data.codigoTuss,
        descricao: data.descricao,
        tempoMedioMinutos: Number(data.tempoMedioMinutos),
        tipoSalaExigida: data.tipoSalaExigida
      };

      if (data.id) {
        await updateProcedimento(data.id, payload);
        addToast("Procedimento atualizado com sucesso!", "success");
      } else {
        await createProcedimento(payload);
        addToast("Procedimento cadastrado com sucesso!", "success");
      }
      loadTuss();
    } catch (error: any) {
      addToast(error.message || "Erro ao salvar os dados do procedimento.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente inativar este procedimento? Ele deixará de aparecer para novas cirurgias.")) {
      try {
        await inativarProcedimento(id);
        addToast("Procedimento inativado com sucesso.", "success");
        loadTuss();
      } catch (error: any) {
        addToast(error.message || "Erro ao inativar o procedimento.", "error");
      }
    }
  };

  return (
    <GenericCrudScreen
      title="Catálogo TUSS"
      subtitle="Tabela de referência para procedimentos e calibragem de tempo padrão"
      isLoading={isLoading}
      columns={[
        { key: "codigoTuss", label: "Código TUSS" },
        { key: "descricao", label: "Descrição do Procedimento" },
        { 
          key: "tempoMedioMinutos", 
          label: "Tempo Médio", 
          render: (val) => <span className="font-bold text-slate-600">{val} min</span> 
        },
        {
          key: "tipoSalaExigida",
          label: "Sala Exigida",
          render: (val) => <span className="text-xs uppercase bg-slate-100 px-2 py-1 rounded-md">{String(val).replace("SALA_", "")}</span>
        }
      ]}
      formFields={[
        { name: "codigoTuss", label: "Código do Procedimento (TUSS)", type: "text", placeholder: "Ex: 31005470" },
        { name: "descricao", label: "Descrição", type: "text", placeholder: "Nome do procedimento" },
        { name: "tempoMedioMinutos", label: "Tempo Médio Estimado (Minutos)", type: "number", placeholder: "Ex: 120" },
        { 
          name: "tipoSalaExigida", 
          label: "Tipo de Sala Exigida", 
          type: "select", 
          options: [
            { label: "Padrão", value: "SALA_PADRAO" },
            { label: "Alta Complexidade", value: "SALA_ALTA_COMPLEXIDADE" },
            { label: "Parto", value: "SALA_PARTO" },
            { label: "Emergência", value: "SALA_EMERGENCIA" }
          ] 
        }
      ]}
      data={tuss}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}