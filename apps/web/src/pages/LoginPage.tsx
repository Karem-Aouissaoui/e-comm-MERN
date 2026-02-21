import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("buyer1@test.com");
  const [password, setPassword] = useState("StrongPass123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/login", { email, password });
      // Force refresh or invalidate queries to update user state
      window.location.href = "/products";
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Login failed (unknown error)";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.login.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.login.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('auth.login.email_label')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('auth.login.password_label')}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}


            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.login.submitting') : t('auth.login.submit')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t bg-muted/50 px-6 py-4">
          <p className="text-sm text-center text-muted-foreground mb-4">
            {t('auth.login.no_account')}{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t('auth.login.create_one')}
            </Link>
          </p>

          <p className="text-xs text-muted-foreground text-center mb-2">
            {t('auth.login.demo')}
          </p>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmail("buyer1@test.com");
                setPassword("StrongPass123!");
              }}
            >
              {t('auth.login.buyer_demo')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmail("supplier1@test.com");
                setPassword("StrongPass123!");
              }}
            >
              {t('auth.login.supplier_demo')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
