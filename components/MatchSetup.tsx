import React from 'react';
import { MatchDetails } from '../types';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

interface MatchSetupProps {
  details: MatchDetails;
  onChange: (details: MatchDetails) => void;
}

export const MatchSetup: React.FC<MatchSetupProps> = ({ details, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...details, [name]: value });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 mb-6">
      <h2 className="text-xl font-bold text-grass-400 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Detalhes da Partida
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-slate-400 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Data
          </label>
          <input
            type="date"
            name="date"
            value={details.date}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-grass-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-slate-400 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" /> Horário
          </label>
          <input
            type="time"
            name="time"
            value={details.time}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-grass-500 outline-none"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-slate-400 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Local
          </label>
          <input
            type="text"
            name="location"
            value={details.location}
            onChange={handleChange}
            placeholder="Ex: Arena Society Bola de Ouro"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-grass-500 outline-none"
          />
        </div>
        <div className="space-y-2">
            <label className="text-slate-400 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" /> Número de Times
            </label>
            <select 
                name="teamsCount"
                value={details.teamsCount}
                onChange={(e) => onChange({...details, teamsCount: Number(e.target.value)})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-grass-500 outline-none"
            >
                <option value="2">2 Times</option>
                <option value="3">3 Times</option>
                <option value="4">4 Times</option>
            </select>
        </div>
      </div>
    </div>
  );
};