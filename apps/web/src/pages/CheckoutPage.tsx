import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function CheckoutPage() {
  const { t } = useTranslation();
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

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center">
           <Spinner size="lg" />
        </div>
     )
  }

  if (error) {
     return (
        <div className="flex h-screen items-center justify-center">
           <div className="max-w-md text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold">{t('checkout.failed')}</h2>
              <p className="text-muted-foreground">{error}</p>
              <Link to="/orders">
                 <Button variant="outline">{t('checkout.back_to_orders')}</Button>
              </Link>
           </div>
        </div>
     );
  }
  
  if (!clientSecret) {
     return <div className="p-8 text-center">{t('checkout.missing_secret')}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-2">
           <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <Lock className="h-6 w-6 text-primary" />
           </div>
          <CardTitle className="text-2xl">{t('checkout.title')}</CardTitle>
          <CardDescription>{t('checkout.order_id', { id: orderId?.slice(-6) })}</CardDescription>
        </CardHeader>
        <CardContent>
           <Elements stripe={stripePromise} options={options}>
             <CheckoutForm orderId={orderId!} />
           </Elements>
        </CardContent>
      </Card>
    </div>
  );
}

function CheckoutForm({ orderId }: { orderId: string }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [success, setSuccess] = useState(false);

  async function pollUntilPaid() {
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
    setSuccess(false);

    if (!stripe || !elements) {
      setMsg("Stripe is still loading, try again in a second.");
      return;
    }

    setBusy(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (result.error) {
        setMsg(result.error.message ?? "Payment confirmation failed.");
        setBusy(false);
        return;
      }

      setMsg(t('checkout.processing'));
      const final = await pollUntilPaid();
      if (final === "paid") {
         setSuccess(true);
         setMsg(t('checkout.success_title'));
         // Optional: Redirect after success
         setTimeout(() => window.location.href = "/orders", 2000);
      }
      else if (final === "failed") setMsg(t('checkout.failed'));
      else setMsg(t('checkout.pending'));
    } catch (err: any) {
      setMsg(err?.message ?? "Unexpected error during payment.");
    } finally {
      if (!success) setBusy(false);
    }
  }

  if (success) {
     return (
        <div className="text-center space-y-4 py-6">
           <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
           <h3 className="text-xl font-bold text-green-700">{t('checkout.success_title')}</h3>
           <p className="text-muted-foreground">{t('checkout.success_sub')}</p>
        </div>
     )
  }

  return (
    <form onSubmit={onPay} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />

      {msg && (
         <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
            {msg}
         </div>
      )}

      <Button 
         className="w-full" 
         size="lg" 
         disabled={busy || !stripe || !elements}
      >
        {busy ? <><Spinner className="mr-2 h-4 w-4 bg-white" /> {t('checkout.processing')}</> : t('checkout.pay_now')}
      </Button>
      
      <div className="flex justify-center">
         <Link to="/orders" className="text-sm text-muted-foreground hover:underline">
            {t('checkout.cancel_return')}
         </Link>
      </div>
    </form>
  );
}
