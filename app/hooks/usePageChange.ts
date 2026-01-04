import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationKey } from "../types/dashboard";

export function usePageChange() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function setParams(value: number, key: PaginationKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value.toString());

    router.push(`${pathname}?${params.toString()}`);
  }

  /**
   * Used for table pagination
   */

  function handlePageChange(page: number, key: PaginationKey) {
    return setParams(page, key);
  }

  function setContextParam(parameter: number, key: PaginationKey) {
    return setParams(parameter, key);
  }

  return { handlePageChange, setContextParam };
}
