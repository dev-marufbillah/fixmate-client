export type Role = "customer" | "technician" | "admin";

export type JobStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Service {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt: string;
}

export interface StatusEvent {
  status: string;
  changedAt: string;
}

export interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: string;
  basePrice: number;
  finalAmount: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: JobStatus;
  paymentStatus: PaymentStatus;
  statusHistory?: StatusEvent[];
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  phone?: string;
  area?: string;
  createdAt: string;
}

export interface PagedServices {
  services: Service[];
  total: number;
  page: number;
  pages: number;
}

export interface StatusCount {
  _id: JobStatus;
  count: number;
}
