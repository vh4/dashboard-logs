// TypeScript types for the Iotera Vending login API response

export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface TransactionTime {
  firestore_timestamp: FirestoreTimestamp;
  timestamp: number;
}

export interface PaymentFee {
  platform_sharing_revenue?: number;
  mdr_qris?: number;
}

export interface PaymentDetail {
  transaction_id?: string;
  transaction_status?: string;
  transaction_time?: string;
  order_id?: string;
  issuer?: string;
  issuer_id?: string;
  ref_no?: string;
  qris_data?: string;
  transaction_reference?: string;
  retrieval_reference_no?: string;
  refund_time?: string;
  payment_status?: string;
  refund_ts?: number;
  payment_reference_no?: string;
  payment_date?: string;
  fraud_status?: string;
  status_message?: string;
  payment_type?: string;
  status_code?: string;
  currency?: string;
  gross_amount?: string;
  merchant_id?: string;
  acquirer?: string;
  payment_detail?: Record<string, unknown>;
}

export interface Payment {
  amount: number;
  method: string;
  nett: number;
  fee: PaymentFee;
  detail: PaymentDetail | string;
  session_id?: string;
}

export interface ProductItem {
  name: string;
  column?: string;
  sku: string;
}

export interface Product {
  device_id: string;
  column?: string;
  name?: string;
  location: string;
  sku?: string;
  quantity?: number;
  price?: number;
  items?: ProductItem[];
}

export interface TransactionDetail {
  transaction_status: string;
  order_id: string;
  refund_time?: number;
  refund_amount?: number;
}

export interface TransactionRecord {
  product: Product;
  payment: Payment;
  detail: TransactionDetail;
  time: TransactionTime;
  devices?: Record<string, unknown>;
}

export interface LoginResponse {
  message: string;
  data: Record<string, TransactionRecord>;
}

export interface LoginRequest {
  username: string;
  password: string;
}
