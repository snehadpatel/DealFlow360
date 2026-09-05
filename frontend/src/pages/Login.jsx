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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] px-4">
      <div className="w-full max-w-md bg-white border border-surface-border rounded-card p-8 shadow-card">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-card bg-primary-50 border border-primary-200 items-center justify-center font-bold text-xl text-primary-500 mb-3">
            DF
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Sign in to DealFlow360</h1>
          <p className="text-sm text-text-secondary mt-1">Select a demo persona to test role-governed flows</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Role Persona</label>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  type="button"
                  key={acc.role}
                  onClick={() => setSelectedRole(acc.role)}
                  className={`p-3 rounded-btn border text-left text-xs transition-all ${
                    selectedRole === acc.role
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-surface-border bg-white text-text-secondary hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-text-primary">{acc.role}</div>
                  <div className="text-text-secondary text-[11px]">{acc.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-pill shadow-btn transition duration-150"
          >
            Sign In as {selectedRole}
          </button>
        </form>
      </div>
    </div>
  );
}
