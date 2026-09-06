import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function Login({ onNavigateToSignup }) {
  const { login, loginDemoPersona, loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login(data.email, data.password);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    if (!response.credential) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle(response.credential);
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoAccounts = [
    { role: "REP", title: "Rahul", badge: "Sales Rep" },
    { role: "MANAGER", title: "Neha", badge: "Sales Mgr" },
    { role: "FINANCE", title: "Sneha", badge: "Finance" },
    { role: "OPERATIONS", title: "Karan", badge: "Operations" },
    { role: "CUSTOMER", title: "Ankit", badge: "ABC Bank" },
    { role: "ADMIN", title: "Arjun", badge: "Admin" },
  ];

  const handlePersonaClick = async (role) => {
    setSelectedPersona(role);
    setIsSubmitting(true);
    setError(null);
    try {
      await loginDemoPersona(role);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not reach the backend. Start it with `uvicorn app.main:app --reload` and seed the demo data."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header with Revalo Primary Orange Logo Icon */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polygon points="12 2 2 7 12 12 22 7 12 2 12 22 22 17 22 7 12 12 2 7 2 17 12 22" />
            </svg>
          </div>
          <h1>DealFlow<span style={{ color: "var(--color-primary)" }}>360</span></h1>
          <p>Sign in to access your sales operations workspace</p>
        </div>

        {/* 1-Click Fast Demo Personas (Pill styled per Design.md Section 4.1) */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              ⚡ Instant Demo Access
            </span>
            <span className="text-[11px] font-semibold text-[#F26C4F]">
              1-click test
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => {
              const isSelected = selectedPersona === acc.role;
              return (
                <button
                  type="button"
                  key={acc.role}
                  onClick={() => handlePersonaClick(acc.role)}
                  className={`px-3 py-2 text-left rounded-xl transition-all text-xs border ${
                    isSelected
                      ? "bg-[#FEECE8] border-[#F26C4F] text-[#F26C4F] font-semibold shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  } ${acc.role === "ADMIN" ? "col-span-2" : ""}`}
                >
                  <div className="font-semibold text-xs leading-tight">{acc.title}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{acc.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="rep@dealflow360.com"
              className={errors.email ? "input-error" : ""}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <button type="button" className="text-link" tabIndex={-1}>
                Forgot password?
              </button>
            </div>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={errors.password ? "input-error" : ""}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          {/* Primary CTA Button (Pill Shape per Design.md Section 4.1) */}
          <button type="submit" className="btn-primary" disabled={isSubmitting} id="login-submit">
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner-sm" />
                Signing in…
              </span>
            ) : (
              "Sign In to Platform"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>Or continue with</span>
        </div>

        {/* Google OAuth Button */}
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in could not be completed.")}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
            shape="pill"
          />
        </div>

        {/* Footer */}
        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="text-link font-semibold ml-1"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
