"use client";

import React, { useState } from "react";
import axios from "axios";
import { ShieldCheck, X, LoaderCircle } from "lucide-react";
import { API_URL } from "../config/admin.config";

export function LoginDialog({
  onClose,
  onLoggedIn,
}: {
  onClose: () => void;
  onLoggedIn: (token: string) => void;
}) {
  const [email, setEmail] = useState("admin.ips@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const payload = response.data?.data ?? response.data;
      if (!payload.accessToken) throw new Error("The API did not return an access token.");
      onLoggedIn(payload.accessToken);
    } catch (reason) {
      setError(
        axios.isAxiosError(reason)
          ? String(reason.response?.data?.message || "Sign in failed.")
          : "Sign in failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fdf3da] text-[#b7790a]">
            <ShieldCheck />
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X />
          </button>
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-[#102a4c]">Administrator sign in</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to publish or update school information.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="mt-5 block text-sm font-bold text-slate-600">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-[#1a5d9c]"
          />
        </label>
        <label className="mt-4 block text-sm font-bold text-slate-600">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-[#1a5d9c]"
          />
        </label>
        <button
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5d9c] px-4 py-3 text-sm font-bold text-white disabled:opacity-60 cursor-pointer"
        >
          {loading && <LoaderCircle size={16} className="animate-spin" />} Sign in securely
        </button>
      </form>
    </div>
  );
}
