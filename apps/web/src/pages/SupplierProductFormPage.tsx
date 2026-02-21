import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Spinner } from "../components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Upload, Link2 } from "lucide-react";
import type { Product } from "../types";

const CATEGORIES = ["Food", "Textiles", "Spices", "Cosmetics", "Home", "Fashion", "Art"];
const CURRENCIES = ["EUR", "USD", "AED", "SAR", "GBP"];

type ImageInput = { mode: "url" | "file"; value: string };

type FormState = {
  title: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  minOrderQty: string;
  images: ImageInput[];
};

const DEFAULT_FORM: FormState = {
  title: "",
  description: "",
  price: "",
  currency: "EUR",
  category: "",
  minOrderQty: "1",
  images: [],
};

function productToForm(p: Product): FormState {
  return {
    title: p.title,
    description: p.description ?? "",
    price: ((p.priceCents ?? 0) / 100).toFixed(2),
    currency: p.currency ?? "EUR",
    category: p.category ?? "",
    minOrderQty: String(p.minOrderQty ?? 1),
    images: (p.imageUrls ?? []).map((url) => ({ mode: "url", value: url })),
  };
}

// ──────────────────────────────────────────────────────────
// ImageSlot: single image input with Upload / URL toggle
// ──────────────────────────────────────────────────────────
interface ImageSlotProps {
  slot: ImageInput;
  index: number;
  t: (key: string) => string;
  onModeChange: (index: number, mode: "url" | "file") => void;
  onValueChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

function ImageSlot({ slot, index, t, onModeChange, onValueChange, onRemove }: ImageSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onValueChange(index, reader.result as string);
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
            slot.mode === "file"
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onModeChange(index, "file")}
        >
          <Upload className="h-3.5 w-3.5" />
          {t("supplier.form.images_upload_file")}
        </button>
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
            slot.mode === "url"
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onModeChange(index, "url")}
        >
          <Link2 className="h-3.5 w-3.5" />
          {t("supplier.form.images_paste_url")}
        </button>
      </div>

      <div className="p-3 flex gap-3 items-start">
        {/* Preview thumbnail */}
        <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-200 border flex-shrink-0 flex items-center justify-center text-gray-400">
          {slot.value ? (
            <img src={slot.value} alt="preview" className="h-full w-full object-cover" />
          ) : uploading ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </div>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          {slot.mode === "file" ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Spinner className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Reading…" : t("supplier.form.images_upload_file")}
              </Button>
              {slot.value && (
                <p className="text-xs text-emerald-600 mt-1 truncate">✓ Image loaded</p>
              )}
            </>
          ) : (
            <Input
              value={slot.value}
              onChange={(e) => onValueChange(index, e.target.value)}
              placeholder={t("supplier.form.images_placeholder")}
              type="url"
              className="text-sm"
            />
          )}
        </div>

        {/* Remove button */}
        <button
          type="button"
          className="text-gray-400 hover:text-red-500 transition-colors mt-1 flex-shrink-0"
          onClick={() => onRemove(index)}
          title={t("supplier.form.images_remove")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────
export function SupplierProductFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) return;
    let cancelled = false;

    async function load() {
      setLoadingProduct(true);
      try {
        const res = await api.get<Product[]>("/products/mine");
        const products: Product[] = Array.isArray(res.data) ? res.data : res.data ?? [];
        const found = products.find((p) => p._id === id);
        if (found && !cancelled) setForm(productToForm(found));
      } catch {
        /* silently fail */
      } finally {
        if (!cancelled) setLoadingProduct(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, isEditMode]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addImage() {
    setForm((prev) => ({ ...prev, images: [...prev.images, { mode: "url", value: "" }] }));
  }

  function setImageMode(index: number, mode: "url" | "file") {
    setForm((prev) => {
      const updated = [...prev.images];
      updated[index] = { mode, value: "" };
      return { ...prev, images: updated };
    });
  }

  function setImageValue(index: number, value: string) {
    setForm((prev) => {
      const updated = [...prev.images];
      updated[index] = { ...updated[index], value };
      return { ...prev, images: updated };
    });
  }

  function removeImage(index: number) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const priceCents = Math.round(parseFloat(form.price) * 100);
    if (isNaN(priceCents) || priceCents < 0) {
      setError(t("supplier.form.error_generic"));
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priceCents,
      currency: form.currency,
      category: form.category,
      minOrderQty: parseInt(form.minOrderQty, 10) || 1,
      imageUrls: form.images.map((img) => img.value).filter((v) => v.trim() !== ""),
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.patch(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      await queryClient.invalidateQueries({ queryKey: ["my-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setSuccess(true);
      setTimeout(() => navigate("/supplier/dashboard"), 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? t("supplier.form.error_generic")
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingProduct) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center animate-in fade-in">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
        <h2 className="text-2xl font-bold text-emerald-700">
          {isEditMode ? t("supplier.form.success_edit") : t("supplier.form.success_create")}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-300">
      <Link
        to="/supplier/dashboard"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("supplier.dashboard.title")}
      </Link>

      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl">
            {isEditMode ? t("supplier.form.edit_title") : t("supplier.form.create_title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("supplier.form.title_label")}</label>
              <Input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder={t("supplier.form.title_placeholder")}
                required
                minLength={2}
                maxLength={120}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("supplier.form.desc_label")}</label>
              <Textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder={t("supplier.form.desc_placeholder")}
                required
                minLength={10}
                maxLength={5000}
                rows={5}
              />
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("supplier.form.price_label")}</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder={t("supplier.form.price_placeholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("supplier.form.currency_label")}</label>
                <Select value={form.currency} onValueChange={(v) => setField("currency", v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category + Min Qty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("supplier.form.category_label")}</label>
                <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={t("products.filters.category_placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t(`products.categories.${c}`, { defaultValue: c })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("supplier.form.min_qty_label")}</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.minOrderQty}
                  onChange={(e) => setField("minOrderQty", e.target.value)}
                  placeholder={t("supplier.form.min_qty_placeholder")}
                  required
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">{t("supplier.form.images_label")}</label>
              {form.images.map((slot, idx) => (
                <ImageSlot
                  key={idx}
                  slot={slot}
                  index={idx}
                  t={t}
                  onModeChange={setImageMode}
                  onValueChange={setImageValue}
                  onRemove={removeImage}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={addImage}
              >
                <Plus className="h-4 w-4" />
                {t("supplier.form.images_add")}
              </Button>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    {t("supplier.form.submitting")}
                  </>
                ) : isEditMode ? (
                  t("supplier.form.submit_edit")
                ) : (
                  t("supplier.form.submit_create")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/supplier/dashboard")}
                disabled={submitting}
              >
                {t("supplier.form.cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
