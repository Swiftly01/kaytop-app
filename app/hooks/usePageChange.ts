import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationKey } from "../types/dashboard";

export function usePageChange() {
  const searhParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function handlePageChange(page: number, key: PaginationKey) {
    const params = new URLSearchParams(searhParams.toString());
    params.set(key, page.toString());

    router.push(`${pathname}?${params.toString()}`);
  }

  return { handlePageChange };
}
