// src/api/groups.js
import client from "./client";

/**
 * List all groups the current user is a member of.
 * Maps to GET /api/groups/
 */
export const getGroups = async () => {
  const { data } = await client.get("/api/groups/");
  return Array.isArray(data) ? data : (data.results ?? []);
};

/**
 * Create a new savings group. Creator is automatically added as Admin.
 * Maps to POST /api/groups/
 * @param {{ name: string, description?: string, goal_amount?: number, target_date?: string }} payload
 */
export const createGroup = async payload => {
  const { data } = await client.post("/api/groups/", payload);
  return data;
};

/**
 * Join an existing group as a Member.
 * Maps to POST /api/groups/:id/join/
 * @param {number|string} groupId
 */
export const joinGroup = async groupId => {
  const { data } = await client.post(`/api/groups/${groupId}/join/`);
  return data;
};


/**
 * Join a group using invite code.
 * Maps to POST /api/groups/join-by-code/
 * @param {string} code
 */
export const joinGroupByCode = async code => {
  const { data } = await client.post("/api/groups/join-by-code/", {
    invite_code: code,
  });
  return data;
};

/**
 * List all transactions for a specific group.
 * Maps to GET /api/groups/:id/transactions/
 * @param {number|string} groupId
 */
export const getGroupTransactions = async groupId => {
  const { data } = await client.get(`/api/groups/${groupId}/transactions/`);
  return Array.isArray(data) ? data : (data.results ?? []);
};

/**
 * Submit a contribution to a group (starts as Pending).
 * Maps to POST /api/groups/:id/transactions/
 * @param {number|string} groupId
 * @param {{ amount: number, gcash_reference?: string, screenshot_url?: string, note?: string }} payload
 */
export const createGroupTransaction = async (groupId, payload) => {
  const { data } = await client.post(`/api/groups/${groupId}/transactions/`, payload);
  return data;
};

/**
 * Admin confirms or rejects a group contribution.
 * Maps to PATCH /api/groups/:groupId/transactions/:txId/
 * @param {number|string} groupId
 * @param {number|string} transactionId
 * @param {'confirmed'|'rejected'} status
 */
export const updateGroupTransactionStatus = async (groupId, transactionId, status) => {
  const { data } = await client.patch(
    `/api/groups/${groupId}/transactions/${transactionId}/`,
    { status },
  );
  return data;
};

export const updateGroupGCash = (groupId, data) =>
  client.patch(`/api/groups/${groupId}/gcash/`, data).then(r => r.data);

export const getPendingAdminTransactions = () =>
  client.get("/api/group-transactions-admin/pending/").then(r => r.data);
