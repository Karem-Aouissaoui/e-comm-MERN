import { useState } from "react";
import { api } from "../lib/api";

/**
 * Minimal login page for MVP.
 * It calls POST /auth/login and relies on HttpOnly cookie auth.
 */
export function LoginPage() {
  const [email, setEmail] = useState("buyer1@test.com");
  const [password, setPassword] = useState("StrongPass123!");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      await api.post("/auth/login", { email, password });
      setResult("Login OK. Cookie should be set. Next: test /auth/me.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Login failed (unknown error)";
      setResult(`Login failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function checkMe() {
    try {
      const res = await api.get("/auth/me");
      setResult("Session OK:\n" + JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Session check failed";
      setResult(`Session check failed: ${msg}`);
    }
  }

  return (
    <div
      style={{ maxWidth: 420, margin: "40px auto", fontFamily: "system-ui" }}
    >
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            type="password"
            autoComplete="current-password"
          />
        </label>

        <button disabled={loading} style={{ padding: 10 }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              setEmail("buyer1@test.com");
              setPassword("StrongPass123!");
            }}
            style={{ padding: 10 }}
          >
            Use Buyer
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail("supplier1@test.com");
              setPassword("StrongPass123!");
            }}
            style={{ padding: 10 }}
          >
            Use Supplier
          </button>
        </div>

        <button type="button" onClick={checkMe} style={{ padding: 10 }}>
          Check /auth/me
        </button>

        {result && (
          <div style={{ whiteSpace: "pre-wrap" }}>
            <strong>Result:</strong> {result}
          </div>
        )}
      </form>
    </div>
  );
}
