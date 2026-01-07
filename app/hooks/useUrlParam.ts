import { useSearchParams } from 'next/navigation';

export  function useUrlParam<T = string>(key: string, parser: (value: string | null) => T): T {
   const searchParams = useSearchParams();
    return parser(searchParams.get(key));
  
}
