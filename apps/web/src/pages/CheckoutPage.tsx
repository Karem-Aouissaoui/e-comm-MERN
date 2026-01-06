import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { api } from "../lib/api";

/**
 * Load Stripe using publishable key (frontend-safe).
 */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Checkout shell:
 * - Fetches clientSecret from backend
 * - Renders Stripe Elements once ready
 */
export function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function createIntent() {
      if (!orderId) return;
      setLoading(true);
      setError("");

      try {
        const res = await api.post("/payments/intent", { orderId });
        setClientSecret(res.data.clientSecret);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to create payment intent"
        );
      } finally {
        setLoading(false);
      }
    }
    createIntent();
  }, [orderId]);

  const options = useMemo(() => ({ clientSecret }), [clientSecret]);

  if (loading) return <div style={{ padding: 24 }}>Preparing checkout…</div>;
  if (error) return <div style={{ padding: 24, color: "red" }}>{error}</div>;
  if (!clientSecret)
    return <div style={{ padding: 24 }}>Missing client secret.</div>;

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <h1>Checkout</h1>

      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm orderId={orderId!} />
      </Elements>
    </div>
  );
}

/**
 * Actual payment form:
 * - Uses Stripe PaymentElement
 * - Confirms payment
 * - Then polls backend payment status until it becomes "paid"
 */
function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function pollUntilPaid() {
    /**
     * Poll /payments/status/:orderId until paid or failed.
     * This avoids relying on Stripe redirect flows during MVP.
     */
    const maxTries = 30; // ~30 * 1s = 30s
    for (let i = 0; i < maxTries; i++) {
      const res = await api.get(`/payments/status/${orderId}`);
      const status = res.data.paymentStatus as string;

      if (status === "paid") return "paid";
      if (status === "failed") return "failed";

      await new Promise((r) => setTimeout(r, 1000));
    }
    return "timeout";
  }

  async function onPay(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!stripe || !elements) {
      setMsg("Stripe is still loading, try again in a second.");
      return;
    }

    setBusy(true);
    try {
      /**
       * Confirm payment using Stripe.js.
       * We do NOT pass amounts here; Stripe already knows the amount from the PaymentIntent.
       */
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // No redirect for most card payments in test mode
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (result.error) {
        setMsg(result.error.message ?? "Payment confirmation failed.");
        setBusy(false);
        return;
      }

      setMsg("Payment submitted. Waiting for confirmation…");

      // Now wait for the webhook to mark the order as paid
      const final = await pollUntilPaid();
      if (final === "paid") setMsg("Payment confirmed. Order is paid.");
      else if (final === "failed") setMsg("Payment failed. Please try again.");
      else setMsg("Payment pending. Refresh in a moment.");
    } catch (err: any) {
      setMsg(err?.message ?? "Unexpected error during payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onPay} style={{ display: "grid", gap: 12 }}>
      <PaymentElement />

      <button
        disabled={busy || !stripe || !elements}
        style={{ padding: 12, fontWeight: 700 }}
      >
        {busy ? "Processing…" : "Pay now"}
      </button>

      {msg && <div style={{ whiteSpace: "pre-wrap" }}>{msg}</div>}
    </form>
  );
}
