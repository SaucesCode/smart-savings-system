import api from "./client";

export const getProfile = () => api.get("/api/users/profile/").then(r => r.data);

export const updateProfileGCash = data =>
  api.patch("/api/users/profile/", data).then(r => r.data);
