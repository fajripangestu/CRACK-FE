const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";

export interface CustomerDetail {
  id: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  user: { name: string; email: string };
  _count: { customer_orders: number };
}

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CustomerOrderApproval {
  id: string;
  department: string;
  position: string;
  status: ApprovalStatus;
  note: string | null;
  decidedAt: string | null;
  decidedBy: { name: string } | null;
}

export interface CustomerOrder {
  id: string;
  SO: string;
  productName: string;
  productType: string;
  totalQuantity: number;
  orderStatus: string;
  orderAt: string;
  deliveryTime: string;
  user: { name: string; email: string };
  customerDetail: {
    companyName: string;
    companyAddress: string;
    contactPerson: string;
  };
  approvals?: CustomerOrderApproval[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCustomerDetail(value: unknown): value is CustomerDetail {
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value._count)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.companyName === "string" &&
    typeof value.companyAddress === "string" &&
    typeof value.contactPerson === "string" &&
    (typeof value.email === "string" || value.email === null) &&
    (typeof value.phone === "string" || value.phone === null) &&
    typeof value.createdAt === "string" &&
    typeof value.user.name === "string" &&
    typeof value.user.email === "string" &&
    typeof value._count.customer_orders === "number"
  );
}

function isCustomerOrder(value: unknown): value is CustomerOrder {
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.customerDetail)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.SO === "string" &&
    typeof value.productName === "string" &&
    typeof value.productType === "string" &&
    typeof value.totalQuantity === "number" &&
    typeof value.orderStatus === "string" &&
    typeof value.orderAt === "string" &&
    typeof value.deliveryTime === "string" &&
    typeof value.user.name === "string" &&
    typeof value.user.email === "string" &&
    typeof value.customerDetail.companyName === "string" &&
    typeof value.customerDetail.companyAddress === "string" &&
    typeof value.customerDetail.contactPerson === "string" &&
    (value.approvals === undefined ||
      (Array.isArray(value.approvals) && value.approvals.every(isCustomerOrderApproval)))
  );
}

function isCustomerOrderApproval(value: unknown): value is CustomerOrderApproval {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.department === "string" &&
    typeof value.position === "string" &&
    (value.status === "PENDING" ||
      value.status === "APPROVED" ||
      value.status === "REJECTED") &&
    (typeof value.note === "string" || value.note === null) &&
    (typeof value.decidedAt === "string" || value.decidedAt === null) &&
    (value.decidedBy === null ||
      (isRecord(value.decidedBy) && typeof value.decidedBy.name === "string"))
  );
}

function errorMessage(body: unknown, fallback: string) {
  if (isRecord(body) && typeof body.message === "string") return body.message;
  return fallback;
}

async function fetchSalesList<T>(
  endpoint: string,
  token: string,
  isItem: (value: unknown) => value is T,
  fallback: string,
): Promise<T[]> {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) throw new Error(errorMessage(body, fallback));
  if (!Array.isArray(body) || !body.every(isItem)) {
    throw new Error("Respons data dashboard Sales tidak valid.");
  }
  return body;
}

export function getCustomerDetails(token: string) {
  return fetchSalesList(
    "customer-details/sales",
    token,
    isCustomerDetail,
    "Gagal memuat daftar customer.",
  );
}

export function getCustomerOrders(token: string) {
  return fetchSalesList(
    "customer-orders/sales",
    token,
    isCustomerOrder,
    "Gagal memuat daftar customer order.",
  );
}

export async function createSalesRecord(
  endpoint: string,
  token: string,
  payload: Record<string, string | number>,
  fallback: string,
) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, fallback));
}

export function getSavedToken() {
  const tokenCookie = document.cookie.split("; ").find((cookie) => cookie.startsWith("token="));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;
}

export function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}
