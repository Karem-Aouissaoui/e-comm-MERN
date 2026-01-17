import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export type Me = {
  userId: string;
  roles: string[];
  email?: string;
};

async function fetchMe(): Promise<Me> {
  const res = await api.get("/auth/me");
  // Check if response has nested .user property (standard NestJS controller return)
  // or if it's flat
  const raw = res.data?.user ?? res.data ?? {};

  // Accept multiple backend shapes safely
  const userId = raw.userId ?? raw._id ?? raw.id ?? "";
  const roles = Array.isArray(raw.roles)
    ? raw.roles
    : typeof raw.accountType === "string"
    ? [raw.accountType]
    : [];

  return { userId, roles, email: raw.email };
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });
}
