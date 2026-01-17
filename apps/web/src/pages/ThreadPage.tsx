import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "../lib/utils";
import { useMe } from "../hooks/useMe";

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
  const { data: me } = useMe();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const safeThreadId = useMemo(() => threadId ?? "", [threadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function load() {
    if (!safeThreadId) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/messaging/threads/${safeThreadId}/messages`);
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
  }, [safeThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    setError("");

    try {
      await api.post(`/messaging/threads/${safeThreadId}/messages`, {
        body: trimmed,
      });

      setText("");
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
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in" style={{ height: "calc(100vh - 120px)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link
            to="/products"
             className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10 w-10"
           >
            <ArrowLeft className="h-4 w-4" />
           </Link>
           <div>
             <h1 className="text-xl font-bold">Chat</h1>
             <p className="text-xs text-muted-foreground font-mono">{safeThreadId}</p>
           </div>
        </div>
      </div>

      <Card className="flex flex-col h-full border-primary-100 shadow-md">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No messages yet. Start the conversation.
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {messages.map((m) => {
                 const isMe = me?.userId === m.senderId;
                 return (
                  <div
                    key={m._id}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      isMe ? "self-end items-end" : "self-start items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      )}
                    >
                      {m.body ?? m.text}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 px-1">
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ""}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t bg-muted/20">
            {error && <div className="text-sm text-destructive mb-2">{error}</div>}
             <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <Button onClick={send} disabled={sending || !text.trim()} size="icon">
                {sending ? <Spinner size="sm" className="text-primary-foreground" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
        </div>
      </Card>
    </div>
  );
}
