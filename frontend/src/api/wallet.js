// src/api/wallet.js
import client from "./client";

/**
 * Fetch (or auto-create) the current user's wallet.
 * Maps to GET /api/wallets/me/
 */
export const getWallet = async () => {
  const { data } = await client.get("/api/wallets/me/");
  return data;
};

/**
 * Update the savings goal on the wallet.
 * Maps to PATCH /api/wallets/:id/
 * @param {number|string} walletId
 * @param {number} savingsGoal
 */
export const updateSavingsGoal = async (walletId, savingsGoal) => {
  const { data } = await client.patch(`/api/wallets/${walletId}/`, {
    savings_goal: savingsGoal,
  });
  return data;
};
