import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function Signup({ onNavigateToLogin }) {
  const { signup, loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const passwordValue = watch("password");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signup(data.name, data.email, data.password, data.role || "REP");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
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
      setError("Google sign-up failed. Please try again.");
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
          <h1>Create an account</h1>
          <p>Join the DealFlow360 platform</p>
        </div>

        {/* Error Banner */}
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Alex Morgan"
              className={errors.name ? "input-error" : ""}
              {...register("name", {
                required: "Full name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              })}
            />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Work email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="alex@dealflow360.com"
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

          {/* Role selector */}
          <div className="form-group">
            <label htmlFor="role">Platform Role</label>
            <select
              id="role"
              className="bg-white text-slate-800 border border-slate-200"
              {...register("role")}
            >
              <option value="REP">Sales Representative (Quotation Builder)</option>
              <option value="MANAGER">Sales Manager (Discount Approver)</option>
              <option value="FINANCE">Finance / Operations (Fulfillment & Billing)</option>
              <option value="CUSTOMER">Customer (Negotiation Portal)</option>
            </select>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="new-password">Password</label>
            <div className="password-wrapper">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={errors.confirmPassword ? "input-error" : ""}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === passwordValue || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Primary CTA Button (Pill shape per Design.md Section 4.1) */}
          <button type="submit" className="btn-primary" disabled={isSubmitting} id="signup-submit">
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner-sm" />
                Creating account…
              </span>
            ) : (
              "Complete Registration"
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
            onError={() => setError("Google sign-up could not be completed.")}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
            shape="pill"
          />
        </div>

        {/* Footer */}
        <p className="auth-footer">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-link font-semibold ml-1"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
