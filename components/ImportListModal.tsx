import React, { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';

interface ImportListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (names: string[]) => void;
}

export const ImportListModal: React.FC<ImportListModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleImport = () => {
    if (!text.trim()) return;
    
    // Split by new line, comma, or semicolon, then clean up
    const names = text
      .split(/[\n,;]+/)
      .map(name => name.trim())
      .filter(name => name.length > 0);

    onImport(names);
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-700 flex flex-col">
        
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="text-indigo-400" /> Importar Lista
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-400">
            Cole abaixo a lista de nomes para confirmar presença automaticamente. Você pode separar por linha, vírgula ou ponto e vírgula.
          </p>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Exemplo:&#10;João Silva&#10;Pedro Henrique&#10;Lucas Santos"
            className="w-full h-48 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-sans text-sm leading-relaxed"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleImport}
                disabled={!text.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Check size={18} /> Processar Nomes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};