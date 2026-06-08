"use client";

import { useAuthContext } from "@/app/src/contexts/authContext";
import { useToast } from "@/app/src/contexts/toastContext";
import { ApiError } from "@/app/src/services/api";
import { loginApi } from "@/app/src/services/authService";
import { getProfissionais } from "@/app/src/services/profissionalService";
import { createUsuario, getUsuarios, toggleUsuarioStatus, updateUsuario } from "@/app/src/services/usuarioService";
import { ProfissionalResponseDTO } from "@/app/src/types/profissional";
import { UsuarioResponseDTO } from "@/app/src/types/usuario";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Edit2, Key, Link as LinkIcon, Loader2, Lock, Plus, Save, Search, Shield, ShieldAlert, UserCheck, UserX, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export default function GestaoUsuariosScreen() {
  const { user: currentUser } = useAuthContext();
  const { addToast } = useToast();
  
  const [busca, setBusca] = useState("");
  const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalResponseDTO[]>([]);
  
  const [isLoadingDados, setIsLoadingDados] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado do Modal de Usuário (Criar / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({ id: "", email: "", senha: "", role: "ROLE_RECEPCAO", profissionalId: "" });
  const isEditing = !!novoUsuario.id;

  // Estado do Modal de Bloqueio (Auditoria)
  const [modalStatus, setModalStatus] = useState({ isOpen: false, usuarioId: "", email: "", ativoAtual: false });
  const [senhaAdminConfirmacao, setSenhaAdminConfirmacao] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const carregarDados = useCallback(async () => {
    setIsLoadingDados(true);
    try {
      const [usersRes, profRes] = await Promise.all([getUsuarios(), getProfissionais()]);
      setUsuarios(usersRes.data || []);
      setProfissionais(profRes.data || []);
    } catch (error: any) {
      addToast(error instanceof ApiError ? error.message : "Erro ao carregar dados", "error");
    } finally {
      setIsLoadingDados(false);
    }
  }, [addToast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ROLE_ADMIN": return <span className="bg-slate-800 text-white px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Shield size={12}/> Admin</span>;
      case "ROLE_GESTOR_CC": return <span className="bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md text-xs font-bold w-fit">Gestor CC</span>;
      case "ROLE_MEDICO": return <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-bold w-fit">Médico</span>;
      case "ROLE_RECEPCAO": return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold w-fit">Recepção</span>;
      default: return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold w-fit">{role}</span>;
    }
  };

  const confirmarToggleStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.sub) return;
    
    setIsSubmittingStatus(true);
    try {
      await loginApi({ email: currentUser.sub, senha: senhaAdminConfirmacao });
      await toggleUsuarioStatus(modalStatus.usuarioId);
      addToast(`Acesso de ${modalStatus.email} alterado com sucesso!`, "success");
      
      setModalStatus({ isOpen: false, usuarioId: "", email: "", ativoAtual: false });
      setSenhaAdminConfirmacao("");
      carregarDados(); 
    } catch (error: any) {
      addToast("Senha de administrador incorreta ou sem permissão.", "error");
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleOpenEdit = (u: UsuarioResponseDTO) => {
    setNovoUsuario({
      id: u.id,
      email: u.email,
      senha: "",
      role: u.role,
      profissionalId: u.profissionalId ? String(u.profissionalId) : ""
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setNovoUsuario({ id: "", email: "", senha: "", role: "ROLE_RECEPCAO", profissionalId: "" });
    setIsModalOpen(true);
  };

  const handleSalvarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...novoUsuario, profissionalId: novoUsuario.role === "ROLE_MEDICO" ? novoUsuario.profissionalId : null };
      
      if (isEditing) {
        await updateUsuario(novoUsuario.id, payload as any);
        addToast("Usuário atualizado com sucesso!", "success");
      } else {
        await createUsuario(payload as any);
        addToast("Usuário criado e credenciais geradas com sucesso!", "success");
      }
      
      setIsModalOpen(false);
      setNovoUsuario({ id: "", email: "", senha: "", role: "ROLE_RECEPCAO", profissionalId: "" });
      carregarDados(); 
    } catch (error: any) {
      addToast(error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} usuário`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => u.email.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-rose-500" /> Controle de Acessos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie quem pode acessar o sistema e seus respectivos níveis de permissão</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer">
          <Plus size={20} /> Novo Acesso
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-100 relative">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" placeholder="Buscar por e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-slate-400 transition-all text-sm"
            />
          </div>
        </div>

        {isLoadingDados ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 text-slate-600">
             <Loader2 className="w-8 h-8 animate-spin mb-2" />
             <p className="text-sm font-bold">Carregando usuários...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Conta (E-mail)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nível de Acesso</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vínculo Clínico</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className={`transition-colors group ${u.ativo ? 'hover:bg-slate-50' : 'bg-slate-50/50 opacity-70'}`}>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">
                      {u.role === "ROLE_MEDICO" ? (
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><LinkIcon size={14} className="text-blue-500" /> {u.nomeProfissional || "Vinculado (ID Oculto)"}</span>
                      ) : (<span className="text-xs text-slate-400 italic">Não se aplica</span>)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold ${u.ativo ? 'text-emerald-600' : 'text-rose-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${u.ativo ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        {u.ativo ? "ATIVO" : "BLOQUEADO"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-white rounded-lg border border-slate-200 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Editar permissões"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        {u.email !== currentUser?.sub ? (
                          <button 
                            onClick={() => setModalStatus({ isOpen: true, usuarioId: u.id, email: u.email, ativoAtual: u.ativo })}
                            className={`p-2 rounded-lg border font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                              u.ativo ? 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50' : 'bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.ativo ? <><UserX size={14}/> Bloquear</> : <><UserCheck size={14}/> Reativar</>}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Sua Conta</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {/* MODAL DE VALIDAÇÃO DE BLOQUEIO ANIMADO */}
        {modalStatus.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => !isSubmittingStatus && setModalStatus({...modalStatus, isOpen: false})} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden"
            >
              <div className={`p-6 border-b flex justify-between items-center ${modalStatus.ativoAtual ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <h2 className={`text-lg font-bold flex items-center gap-2 ${modalStatus.ativoAtual ? 'text-rose-700' : 'text-emerald-700'}`}>
                  <ShieldAlert size={20} /> Autenticação Necessária
                </h2>
                <button onClick={() => setModalStatus({...modalStatus, isOpen: false})} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
              </div>
              <form onSubmit={confirmarToggleStatus} className="p-6 space-y-5">
                <p className="text-sm text-slate-600">
                  Você está prestes a <strong>{modalStatus.ativoAtual ? 'bloquear' : 'liberar'}</strong> o acesso de <span className="font-bold text-slate-900">{modalStatus.email}</span>. Confirme sua senha de administrador para prosseguir.
                </p>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" required value={senhaAdminConfirmacao} onChange={(e) => setSenhaAdminConfirmacao(e.target.value)} placeholder="Sua senha de administrador"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalStatus({...modalStatus, isOpen: false})} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSubmittingStatus} className={`flex-1 text-white font-bold py-2.5 rounded-xl shadow-md flex justify-center items-center gap-2 cursor-pointer transition-colors disabled:opacity-70 ${modalStatus.ativoAtual ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    {isSubmittingStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check size={18} /> Confirmar</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL CRIAR / EDITAR USUÁRIO ANIMADO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => !isSubmitting && setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{isEditing ? "Editar Acesso" : "Novo Acesso"}</h2>
                  <p className="text-xs text-slate-500 mt-1">{isEditing ? "Altere as permissões do colaborador" : "Crie credenciais para um colaborador"}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-2 transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSalvarUsuario} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">E-mail Corporativo</label>
                  <input 
                    type="email" required value={novoUsuario.email} onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})} placeholder="nome@hbu.com.br"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-slate-800 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase">Senha {isEditing ? "(Opcional)" : "Provisória"}</label>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required={!isEditing} 
                      value={novoUsuario.senha} 
                      onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})} 
                      placeholder={isEditing ? "Deixe em branco para manter a atual" : "Defina uma senha inicial"}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Perfil de Acesso (Role)</label>
                  <select 
                    required value={novoUsuario.role} onChange={(e) => setNovoUsuario({...novoUsuario, role: e.target.value, profissionalId: ""})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-slate-800 font-bold transition-all"
                  >
                    <option value="ROLE_RECEPCAO">Recepção</option>
                    <option value="ROLE_MEDICO">Médico</option>
                    <option value="ROLE_GESTOR_CC">Gestor do Centro Cirúrgico</option>
                    <option value="ROLE_ADMIN">Administrador (TI)</option>
                  </select>
                </div>

                {novoUsuario.role === "ROLE_MEDICO" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <label className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
                      <LinkIcon size={14} /> Vincular a um Profissional (Obrigatório)
                    </label>
                    <select 
                      required value={novoUsuario.profissionalId} onChange={(e) => setNovoUsuario({...novoUsuario, profissionalId: e.target.value})}
                      className="w-full bg-white border border-blue-200 text-slate-900 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 text-sm transition-all"
                    >
                      <option value="" disabled>Selecione o médico...</option>
                      {profissionais.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto} - {p.crmCoren}</option>)}
                    </select>
                  </motion.div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70 transition-colors">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}