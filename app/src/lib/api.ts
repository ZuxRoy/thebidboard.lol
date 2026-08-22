import { useMutation, useQuery } from "@tanstack/react-query";
import type { FilterId } from "./categories";
import type { SocialPlatform } from "./validators";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error ?? "Something went wrong. Please try again.");
  }
  return body as T;
}

export interface ListingRow {
  id: string;
  rank: number;
  domain: string;
  url: string;
  description: string;
  category: string;
  socials: Partial<Record<SocialPlatform, string>>;
  amountCents: number;
}

interface ListingsResponse {
  items: ListingRow[];
  total: number;
  page: number;
  limit: number;
}

export function useListings(category: FilterId, page: number, limit: number) {
  return useQuery({
    queryKey: ["listings", category, page, limit],
    queryFn: ({ signal }) =>
      apiFetch<ListingsResponse>(
        `/listings?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`,
        { signal }
      ),
    placeholderData: (previous) => previous,
  });
}

interface TopListingResponse {
  topAmountCents: number;
  nextAmountCents: number;
  topDomain: string | null;
}

export function useTopListing() {
  return useQuery({
    queryKey: ["listings", "top"],
    queryFn: ({ signal }) => apiFetch<TopListingResponse>("/listings/top", { signal }),
    refetchInterval: 30_000,
  });
}

interface TickerResponse {
  items: Array<{ domain: string; amountCents: number; category: string }>;
}

export function useTicker() {
  return useQuery({
    queryKey: ["ticker"],
    queryFn: ({ signal }) => apiFetch<TickerResponse>("/ticker", { signal }),
    refetchInterval: 20_000,
  });
}

export interface CreateListingPayload {
  url: string;
  description: string;
  category: string;
  socials: Partial<Record<SocialPlatform, string>>;
  amountCents: number;
}

export function useCreateListing() {
  return useMutation({
    mutationFn: (payload: CreateListingPayload) =>
      apiFetch<{ checkoutUrl: string }>("/listings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
