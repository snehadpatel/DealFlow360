import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('REP');

  const demoAccounts = [
    { role: 'REP', name: 'Alex Rep', email: 'alex.rep@dealflow360.com' },
    { role: 'MANAGER', name: 'Maria Manager', email: 'maria.manager@dealflow360.com' },
    { role: 'FINANCE', name: 'Felix Finance', email: 'felix.finance@dealflow360.com' },
    { role: 'CUSTOMER', name: 'Acme Corp (Buyer)', email: 'buyer@acmecorp.com' },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const account = demoAccounts.find((a) => a.role === selectedRole);
    login(account, 'mock-jwt-token-' + selectedRole.toLowerCase());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center font-bold text-xl text-emerald-400 mb-3">
            DF
          </div>
          <h1 className="text-2xl font-bold text-white">Sign in to DealFlow360</h1>
          <p className="text-sm text-slate-400 mt-1">Select a demo persona to test role-governed flows</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Role Persona</label>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  type="button"
                  key={acc.role}
                  onClick={() => setSelectedRole(acc.role)}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    selectedRole === acc.role
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold">{acc.role}</div>
                  <div className="truncate text-slate-400 text-[11px]">{acc.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition duration-150"
          >
            Sign In as {selectedRole}
          </button>
        </form>
      </div>
    </div>
  );
}
