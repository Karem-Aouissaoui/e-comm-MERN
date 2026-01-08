import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

/**
 * Minimal message model for UI.
 * Extend later (attachments, read receipts, etc.).
 */
type ThreadMessage = {
  _id: string;
  threadId: string;
  senderId: string;
  body: string;
  text?: string;
  createdAt?: string;
};

export function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();

  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const safeThreadId = useMemo(() => threadId ?? "", [threadId]);

  async function load() {
    if (!safeThreadId) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/messaging/threads/${safeThreadId}/messages`);
      // Your backend likely returns an array; if it returns { items: [] }, adjust here.
      setMessages(res.data ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load messages"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeThreadId]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    setError("");

    try {
      await api.post(`/messaging/threads/${safeThreadId}/messages`, {
        body: trimmed,
      });

      // Clear input immediately (good UX)
      setText("");

      // Reload messages (simple MVP approach)
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Messages</h1>
        <Link to="/products">Back to products</Link>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
        Thread: <span style={{ fontFamily: "monospace" }}>{safeThreadId}</span>
      </div>

      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}

      <div
        style={{
          marginTop: 16,
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          minHeight: 300,
        }}
      >
        {loading ? (
          <div>Loading…</div>
        ) : messages.length === 0 ? (
          <div style={{ opacity: 0.8 }}>
            No messages yet. Start the conversation.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {messages.map((m) => (
              <div
                key={m._id}
                style={{
                  padding: 10,
                  border: "1px solid #eee",
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  From:{" "}
                  <span style={{ fontFamily: "monospace" }}>{m.senderId}</span>
                  {m.createdAt
                    ? ` • ${new Date(m.createdAt).toLocaleString()}`
                    : ""}
                </div>
                <div style={{ marginTop: 6 }}>{m.body ?? m.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          style={{ flex: 1, padding: 10 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          style={{ padding: 10, fontWeight: 700 }}
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
