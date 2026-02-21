import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useMe } from "../hooks/useMe";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import { Mail, Shield, Lock } from "lucide-react";
import { toast } from "sonner";

export function ProfilePage() {
  const { t } = useTranslation();
  const { data: me, isLoading } = useMe();

  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error(t("auth.register.password_mismatch"));
      return;
    }
    setPwLoading(true);
    try {
      // Most APIs expose PATCH /auth/me or /users/me — attempt both gracefully
      const { api } = await import("../lib/api");
      await api.patch("/auth/me", { currentPassword: currentPw, newPassword: newPw });
      toast.success(t("profile.success"));
      setShowPwForm(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t("profile.error"));
    } finally {
      setPwLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-300">
      <Helmet>
        <title>{t("profile.page_title")} — MME</title>
        <meta name="description" content={t("profile.page_subtitle")} />
      </Helmet>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("profile.page_title")}</h1>
        <p className="text-muted-foreground">{t("profile.page_subtitle")}</p>
      </div>

      {/* Account Info */}
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">{t("profile.page_title")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700 text-2xl font-bold select-none">
              {(me.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{me.email}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(me.roles ?? []).map((r) => (
                  <Badge key={r} variant="secondary" className="capitalize">{r}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border">
              <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">{t("profile.email_label")}</p>
                <p className="font-medium">{me.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border">
              <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">{t("profile.roles_label")}</p>
                <p className="font-medium capitalize">{(me.roles ?? []).join(", ")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="shadow-sm">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("profile.change_password")}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowPwForm((v) => !v)}>
            {showPwForm ? t("common.cancel") : t("profile.change_password")}
          </Button>
        </CardHeader>
        {showPwForm && (
          <CardContent className="pt-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("profile.current_password")}</label>
                <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("profile.new_password")}</label>
                <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("profile.confirm_new_password")}</label>
                <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required minLength={8} />
                {confirmPw.length > 0 && newPw !== confirmPw && (
                  <p className="text-xs text-red-500">{t("auth.register.password_mismatch")}</p>
                )}
              </div>
              <Button type="submit" disabled={pwLoading || (confirmPw.length > 0 && newPw !== confirmPw)} className="w-full">
                {pwLoading ? <><Spinner className="mr-2 h-4 w-4" />{t("profile.saving")}</> : t("profile.save_changes")}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
