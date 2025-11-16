import React, { useState } from 'react';
import { Player, Position, PlayerType } from '../types';
import { UserPlus, Star } from 'lucide-react';

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ onAddPlayer }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<Position>(Position.MEIO);
  const [type, setType] = useState<PlayerType>(PlayerType.EFETIVO);
  const [level, setLevel] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      phone,
      position,
      type,
      level,
      confirmed: false
    };

    onAddPlayer(newPlayer);
    setName('');
    setPhone('');
    setLevel(3);
    // Keep position and type as they might be adding many similar players
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-grass-400" /> Adicionar Jogador
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-1 md:col-span-1 bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-grass-500"
        />
        
        <input
          type="tel"
          placeholder="Telefone (WhatsApp)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="col-span-1 bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-grass-500"
        />

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value as Position)}
          className="col-span-1 bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-grass-500"
        >
          {Object.values(Position).map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as PlayerType)}
          className="col-span-1 bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-grass-500"
        >
          {Object.values(PlayerType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div className="col-span-1 flex items-center justify-between bg-slate-900 border border-slate-600 rounded-lg p-2 px-3">
            <span className="text-slate-400 text-sm">Nível</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setLevel(star)}
                        className={`w-4 h-4 ${star <= level ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                    >
                        <Star size={16} />
                    </button>
                ))}
            </div>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full mt-4 bg-grass-600 hover:bg-grass-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Adicionar à Lista
      </button>
    </form>
  );
};