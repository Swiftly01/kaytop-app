import { PAGINATION_LIMIT } from "@/lib/config";
import { PaginationKey } from "../types/dashboard";
import { useUrlParam } from "./useUrlParam";

export function useUrlPagination(key: PaginationKey) {
  const page = useUrlParam<number>(key, (value) =>
    Math.max(1, Number(value ?? 1))
  );

  return { page, limit: PAGINATION_LIMIT };
}
