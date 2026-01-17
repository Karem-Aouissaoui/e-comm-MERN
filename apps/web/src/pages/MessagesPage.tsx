import { EmptyState } from "../components/ui/empty-state";
import { MessageSquare } from "lucide-react";

export function MessagesPage() {
  return (
    <div className="max-w-2xl mx-auto mt-12">
      <EmptyState
        icon={MessageSquare}
        title="Messages"
        description="Select a conversation from the sidebar or start a new one by asking a supplier about a product."
      />
    </div>
  );
}
