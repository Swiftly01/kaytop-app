import Image from 'next/image'
import Link from 'next/link'
import logo from "@/public/logo.png"
import { JSX } from 'react'

export default function Logo(): JSX.Element {
  return (
         <Link href="/" className="flex items-center cursor-pointer">
          <Image height="50" src={logo} alt="Kaytop logo" quality={75} loading="eager" priority />
          <span className="hidden text-xl font-semibold text-dark md:block">
            Kaytop Multipurpose Investment
          </span>
          <span className="text-xl font-semibold text-dark md:hidden">
            Kaytop
          </span>
        </Link>
  )
}
