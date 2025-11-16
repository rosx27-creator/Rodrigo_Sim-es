import React, { useState, useEffect } from 'react';
import { Player, Position, PlayerType } from '../types';
import { Save, X, Star, User } from 'lucide-react';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onSave: (updatedPlayer: Player) => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({ isOpen, onClose, player, onSave }) => {
  const [name, setName] = useState(player.name);
  const [phone, setPhone] = useState(player.phone);
  const [position, setPosition] = useState<Position>(player.position);
  const [type, setType] = useState<PlayerType>(player.type);
  const [level, setLevel] = useState(player.level);

  // Update local state when player prop changes
  useEffect(() => {
    setName(player.name);
    setPhone(player.phone);
    setPosition(player.position);
    setType(player.type);
    setLevel(player.level);
  }, [player]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...player, // Keep ID and confirmed status
      name,
      phone,
      position,
      type,
      level
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-700 flex flex-col">
        
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-grass-400" /> Editar Jogador
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-grass-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Telefone (WhatsApp)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-grass-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-slate-400 mb-1">Posição</label>
                <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-grass-500 outline-none"
                >
                {Object.values(Position).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm text-slate-400 mb-1">Tipo</label>
                <select
                value={type}
                onChange={(e) => setType(e.target.value as PlayerType)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-grass-500 outline-none"
                >
                {Object.values(PlayerType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Nível de Habilidade</label>
            <div className="flex gap-2 bg-slate-900 p-3 rounded-lg border border-slate-600 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setLevel(star)}
                        className={`w-8 h-8 transition-transform hover:scale-110 ${star <= level ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                    >
                        <Star size={24} />
                    </button>
                ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
                Cancelar
            </button>
            <button 
                type="submit"
                className="px-6 py-2 bg-grass-600 hover:bg-grass-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-grass-900/20"
            >
                <Save size={18} /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};