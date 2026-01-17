import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useMe } from "../hooks/useMe";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import { ArrowLeft, MessageSquare } from "lucide-react";

type Product = {
  _id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  category?: string;
  minOrderQty?: number;
  imageUrls?: string[];
  supplierId?: string;
};

async function fetchProduct(id: string): Promise<Product> {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: me } = useMe();

  const [actionError, setActionError] = useState("");

  const productId = useMemo(() => id ?? "", [id]);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId,
  });

  const isBuyer = (me?.roles ?? []).includes("buyer");

  async function askSupplier() {
    if (!product) return;

    setActionError("");

    try {
      const res = await api.get(`/products/${product._id}/thread`);
      const threadId = res.data?.threadId ?? res.data?._id;

      if (!threadId) throw new Error("Server did not return threadId");

      navigate(`/threads/${threadId}`);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to open product thread."
      );
    }
  }

  async function buyNow() {
    if (!product) return;
    setActionError("");

    try {
      // 1. Create order
      const res = await api.post("/orders", {
        productId: product._id,
        quantity: product.minOrderQty ?? 1,
      });
      const orderId = res.data._id;

      // 2. Redirect to checkout
      navigate(`/checkout/${orderId}`);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to create order."
      );
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link
          to="/products"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to products
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-destructive text-center">
          Failed to load product.
        </div>
      )}

      {!isLoading && !error && product && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product info */}
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex gap-2 mb-2">
                     {product.category && (
                        <Badge variant="secondary">{product.category}</Badge>
                     )}
                  </div>
                  <CardTitle className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                    {product.title}
                  </CardTitle>
                </div>
                <div className="text-right">
                <div className="text-2xl font-bold text-primary-600 whitespace-nowrap">
                    {((product.priceCents ?? 0) / 100).toLocaleString()} <span className="text-lg font-normal text-muted-foreground">{product.currency}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {product.description}
              </div>

               {product.minOrderQty !== undefined && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                    Minimum order: {product.minOrderQty} units
                  </div>
                )}

              {/* Images */}
              {product.imageUrls && product.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {product.imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-video rounded-xl overflow-hidden bg-gray-100 border"
                    >
                      <img
                        src={url}
                        alt={`${product.title} - ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Actions */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Interested?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Have questions about this product? Start a conversation directly with the supplier.
                </p>
                
                {actionError && (
                  <div className="text-sm text-destructive p-2 bg-destructive/10 rounded-md">
                    {actionError}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                 {!me?.userId ? (
                  <Link to="/login" className="w-full">
                    <Button className="w-full" size="lg">
                      Login to contact supplier
                    </Button>
                  </Link>
                ) : !isBuyer ? (
                   <div className="text-sm text-center text-muted-foreground bg-muted p-2 rounded-md w-full">
                    Only buyers can start chats.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                     <Button onClick={askSupplier} variant="outline" size="lg" className="w-full">
                       <MessageSquare className="mr-2 h-4 w-4" />
                       Chat
                     </Button>
                     <Button onClick={buyNow} size="lg" className="w-full">
                       Buy Now
                     </Button>
                  </div>
                )}
                 <p className="text-xs text-muted-foreground text-center">
                  Order support available after purchase.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
