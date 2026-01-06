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

export type Order = {
  _id: string;
  totalCents: number;
  currency: string;
  paymentStatus: "unpaid" | "requires_action" | "paid" | "failed" | "refunded";
};
