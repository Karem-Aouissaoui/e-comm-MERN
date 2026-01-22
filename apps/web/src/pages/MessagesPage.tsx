import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { EmptyState } from "../components/ui/empty-state";
import { Spinner } from "../components/ui/spinner";
import { MessageSquare, ShoppingBag, Package, User, Clock, AlertCircle } from "lucide-react";
import type { Thread } from "../types";
import { cn } from "../lib/utils";

async function fetchInbox(): Promise<Thread[]> {
  const res = await api.get("/messaging/inbox");
  return res.data;
}

export function MessagesPage() {
  const navigate = useNavigate();
  const { data: threads, isLoading, error } = useQuery({
    queryKey: ["inbox"],
    queryFn: fetchInbox,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 px-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
             <AlertCircle className="h-5 w-5" />
             <p>Failed to load messages. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="Start a conversation by asking a supplier about a product or discussing an order."
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        Messages
      </h1>
      
      <div className="space-y-3">
        {threads.map((thread) => (
          <div 
            key={thread.threadId}
            onClick={() => navigate(`/threads/${thread.threadId}`)}
            className="group relative bg-white border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
               {/* Icon / Avatar logic */}
               <div className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  thread.orderId ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100" : "bg-purple-50 text-purple-600 group-hover:bg-purple-100"
               )}>
                  {thread.orderId ? <ShoppingBag className="h-6 w-6" /> : <Package className="h-6 w-6" />}
               </div>

               <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                          {/* Use populated name or fallback */}
                          {thread.otherPartyName || "Unknown User"}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleDateString() : "New"}
                      </span>
                  </div>

                  {/* Context Label (Order # or Product Question) */}
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                      {thread.orderLabel ? (
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                             {thread.orderLabel}
                          </span>
                      ) : (
                          <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100">
                             Product Inquiry
                          </span>
                      )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {thread.lastMessageText || <span className="italic text-gray-400">No messages yet</span>}
                  </p>
               </div>
            </div>
            
            {/* Visual indicator for type */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               {/* Could add 'View' button or similar here if desired */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
