import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import { Spinner } from "./ui/spinner";
import { EmptyState } from "./ui/empty-state";
import { ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

/**
 * RequireAuth blocks routes unless user is logged in.
 */
export function RequireAuth(props: { children: React.ReactNode }) {
  const { data: me, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <div className="flex bg-background h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If /auth/me returns 401, react-query will set error.
  // Treat that as "not authenticated".
  if (!me || error) {
    return <Navigate to="/login" replace />;
  }

  return <>{props.children}</>;
}

/**
 * RequireRole blocks routes unless user has at least one role.
 */
export function RequireRole(props: {
  roles: string[];
  children: React.ReactNode;
}) {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
     return (
        <div className="flex bg-background h-screen w-full items-center justify-center">
           <Spinner size="lg" />
        </div>
     );
  }
  
  if (!me) return <Navigate to="/login" replace />;

  const ok = props.roles.some((r) => me.roles.includes(r));
  if (!ok) {
     return (
        <div className="flex bg-background h-screen w-full items-center justify-center p-4">
           <EmptyState
              icon={ShieldAlert}
              title="Access Denied"
              description="You do not have permission to view this page."
              action={
                 <Link to="/products">
                    <Button variant="outline">Back to Home</Button>
                 </Link>
              }
           />
        </div>
     );
  }

  return <>{props.children}</>;
}
