// src/api/client.js
// Central axios instance.
// The request interceptor automatically attaches the Supabase JWT
// to every request — no component ever touches auth headers directly.

import axios from "axios";
import { supabase } from "../lib/supabaseClient";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Auth interceptor ─────────────────────────────────────────────────────────
// Runs before every request. Reads the active Supabase session and injects
// the access token. If there's no session, the request goes through without
// a token — Django will return 401, which is the correct behaviour.
client.interceptors.request.use(async config => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// Normalises errors so every .catch() receives a plain Error with a readable
// message instead of Axios's verbose error object.
client.interceptors.response.use(
  response => response,
  error => {
    error.friendlyMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject(error);
  },
);

export default client;
