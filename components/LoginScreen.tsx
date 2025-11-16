
import React, { useState } from 'react';
import { Trophy, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';

interface LoginScreenProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulating network delay
    setTimeout(() => {
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('Email ou senha inválidos.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-grass-500 to-grass-700 rounded-2xl shadow-lg shadow-grass-500/20 mb-4">
            <Trophy className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PeladaPro AI</h1>
          <p className="text-slate-400">Área do Cliente</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-200 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 bg-slate-900 border border-slate-600 rounded-lg py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-grass-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 bg-slate-900 border border-slate-600 rounded-lg py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-grass-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-grass-600 hover:bg-grass-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grass-500 font-bold transition-all shadow-lg shadow-grass-900/50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Acessar <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Esqueceu a senha?{' '}
              <a href="#" className="font-medium text-grass-400 hover:text-grass-300">
                Fale com o suporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
