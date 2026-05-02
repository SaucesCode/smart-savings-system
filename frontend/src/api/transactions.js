// src/api/transactions.js
import client from "./client";

/**
 * List all transactions for the current user.
 * Maps to GET /api/transactions/
 * Returns a plain array (handles both paginated and non-paginated responses).
 */
export const getTransactions = async () => {
  const { data } = await client.get("/api/transactions/");
  return Array.isArray(data) ? data : (data.results ?? []);
};

/**
 * Submit a new deposit or withdrawal transaction (starts as Pending).
 * Maps to POST /api/transactions/
 * @param {{ transaction_type: 'deposit'|'withdrawal'|'contribution', amount: number, reference_number?: string, screenshot_url?: string, note?: string }} payload
 */
export const createTransaction = async payload => {
  const { data } = await client.post("/api/transactions/", payload);
  return data;
};

/**
 * Update a transaction's status (confirm / reject).
 * Maps to PATCH /api/transactions/:id/
 * @param {number|string} transactionId
 * @param {'confirmed'|'rejected'} status
 */
export const updateTransactionStatus = async (transactionId, status) => {
  const { data } = await client.patch(`/api/transactions/${transactionId}/`, { status });
  return data;
};
