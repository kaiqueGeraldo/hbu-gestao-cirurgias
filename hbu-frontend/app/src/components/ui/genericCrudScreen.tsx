"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Edit2, Plus, Save, Search, Trash2, X } from "lucide-react";
import React, { useState } from "react";

type ColumnDef = { key: string; label: string; render?: (value: any, item: any) => React.ReactNode };
type FieldDef = { name: string; label: string; type: "text" | "number" | "select"; options?: { label: string, value: string | number }[], placeholder?: string };

interface GenericCrudScreenProps {
  title: string;
  subtitle: string;
  columns: ColumnDef[];
  formFields: FieldDef[];
  data: any[];
  onSave: (data: any) => void;
  onDelete?: (id: any) => void;
  isLoading?: boolean;
}

export default function GenericCrudScreen({ title, subtitle, columns, formFields, data, onSave, onDelete, isLoading = false }: GenericCrudScreenProps) {
  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const isEditing = !!formData.id;

  const handleOpenModal = (item: any = null) => {
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setFormData({}), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    handleCloseModal();
  };

  const dataFiltrada = data.filter(item => 
    Object.values(item).some(val => String(val).toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={20} /> Novo Registro
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-100">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                {columns.map(col => <th key={col.key} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{col.label}</th>)}
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dataFiltrada.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors group">
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 text-sm text-slate-700 font-medium whitespace-nowrap">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-blue-600 bg-white rounded-lg border border-slate-200 transition-all cursor-pointer"><Edit2 size={16} /></button>
                      {onDelete && <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-lg border border-slate-200 transition-all cursor-pointer"><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dataFiltrada.length === 0 && !isLoading && <div className="text-center py-12 text-slate-500 font-medium">Nenhum registro encontrado.</div>}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed h-full inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={handleCloseModal} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{isEditing ? "Editar Registro" : "Novo Registro"}</h2>
                  <p className="text-sm text-slate-500 mt-1">Preencha as informações abaixo</p>
                </div>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"><X size={20} /></button>
              </div>
              
              <form id="generic-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {formFields.map(field => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">{field.label}</label>
                    
                    {field.type === "select" ? (
                      <div className="relative group">
                        <select 
                          required value={formData[field.name] || ""} 
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 pr-10 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none cursor-pointer font-medium"
                        >
                          <option value="" disabled>Selecione...</option>
                          {/* Renderização ajustada para ler label e value do objeto */}
                          {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-600 transition-colors"><ChevronDown size={20} /></div>
                      </div>
                    ) : (
                      <input 
                        type={field.type} required placeholder={field.placeholder} value={formData[field.name] || ""} 
                        onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
                      />
                    )}
                  </div>
                ))}
              </form>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">Cancelar</button>
                <button type="submit" form="generic-form" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md cursor-pointer flex justify-center items-center gap-2 transition-all"><Save size={18} /> Salvar</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}