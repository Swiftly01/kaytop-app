"use client"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_session.token") || document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];


    if(!token){
      router.push("/login");
    }
  }, [router]);
}
