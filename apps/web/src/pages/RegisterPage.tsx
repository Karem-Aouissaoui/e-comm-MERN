import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "../components/ui/card";

// Simple password strength: 0–4
function getStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabel = (s: number, t: (k: string) => string) =>
  [t("auth.register.strength_weak"), t("auth.register.strength_fair"), t("auth.register.strength_good"), t("auth.register.strength_strong")][Math.min(s, 3)];

const strengthColor = (s: number) =>
  ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"][Math.min(s, 3)];

export function RegisterPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "supplier">("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const pwStrength = getStrength(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.register.password_mismatch"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password, role });
      window.location.href = "/products";
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Registration failed (unknown error)";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Helmet>
        <title>{t("auth.register.title")} — MME</title>
      </Helmet>
      <Card className="w-full max-w-md shadow-lg border-primary-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.register.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.register.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="flex justify-center gap-4 mb-2">
              <div
                onClick={() => setRole("buyer")}
                className={`cursor-pointer border rounded-lg p-4 w-1/2 text-center transition-all ${role === 'buyer' ? 'bg-primary-50 border-primary ring-2 ring-primary/20' : 'hover:bg-slate-50'}`}
              >
                <div className="font-semibold text-gray-900">{t('auth.register.buyer_role')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('auth.register.buyer_desc')}</div>
              </div>
              <div
                onClick={() => setRole("supplier")}
                className={`cursor-pointer border rounded-lg p-4 w-1/2 text-center transition-all ${role === 'supplier' ? 'bg-primary-50 border-primary ring-2 ring-primary/20' : 'hover:bg-slate-50'}`}
              >
                <div className="font-semibold text-gray-900">{t('auth.register.supplier_role')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('auth.register.supplier_desc')}</div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                {t('auth.register.name_label')}
              </label>
              <Input
                id="name" type="text" placeholder="John Doe" value={name}
                onChange={(e) => setName(e.target.value)} disabled={loading} required minLength={2}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                {t('auth.register.email_label')}
              </label>
              <Input
                id="email" type="email" placeholder="name@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={loading} required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                {t('auth.register.password_label')}
              </label>
              <Input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} disabled={loading} required minLength={8}
                placeholder={t('auth.register.password_placeholder')}
              />
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < pwStrength ? strengthColor(pwStrength - 1) : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("auth.register.password_strength")}: <span className="font-medium">{strengthLabel(pwStrength - 1, t)}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                {t('auth.register.confirm_password_label')}
              </label>
              <Input
                id="confirmPassword" type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} required minLength={8}
                placeholder={t('auth.register.confirm_password_placeholder')}
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-500">{t("auth.register.password_mismatch")}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base shadow-sm" disabled={loading || (confirmPassword.length > 0 && password !== confirmPassword)}>
              {loading ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t bg-muted/50 px-6 py-4">
          <p className="text-sm text-center text-muted-foreground">
            {t('auth.register.has_account')}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('auth.register.sign_in')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
