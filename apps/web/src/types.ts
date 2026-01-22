export type Product = {
  _id: string;
  title: string;
  description?: string;
  currency: string;
  // Your backend might store money as priceCents (recommended). Adjust if needed.
  priceCents: number;
  category?: string;
  imageUrls?: string[];
  minOrderQty?: number;
};

export type OrderItem = {
  productId: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
  // Optional: extended properties if you fetch them separately later
  product?: Product;
};

export type Order = {
  _id: string;
  totalCents: number;
  currency: string;
  paymentStatus: "unpaid" | "requires_action" | "paid" | "failed" | "refunded";
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export type Thread = {
  threadId: string;
  buyerId: string;
  supplierId: string;
  productId?: string;
  orderId?: string;
  lastMessageText: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Enriched fields from inbox
  otherPartyName?: string;
  orderLabel?: string;
  orderStatus?: string;
  orderTotal?: { cents: number; currency: string };
};
