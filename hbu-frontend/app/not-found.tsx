import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center max-w-md w-full relative overflow-hidden">
        
        {/* Background Blur */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <SearchX className="text-slate-400 w-10 h-10" />
          </div>
          
          <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-slate-700 mb-3">Página não encontrada</h2>
          
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            O recurso que você está tentando acessar não existe, foi movido ou você não tem permissão para visualizá-lo.
          </p>
          
          <Link 
            href="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Voltar para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}