import React, { JSX } from "react";
import clients from "@/public/clients.svg";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import doubleiphone from "@/public/doubleiphone.svg";
import Image from "next/image";
import Button from "./Button";
import Link from "next/link";
import { ROUTES } from "@/lib/utils";

export default function Clients(): JSX.Element {
  return (
    <>
      <div className="grid grid-cols-1 p-5 md:grid-cols-2 md:my-15">
        <div className="self-center">
          <h1 className="py-4 text-lg font-medium text-center md:text-left text-primary-300">
            Target clients
          </h1>
          <p className="tracking-wide text-neutral-500 text-md">
            Kay Top serves a wide range of clients including individuals, market
            traders, small and medium enterprises, farmers, and community
            groups. We aim to empower those with limited access to traditional
            banking, supporting their financial growth and inclusion.
          </p>
        </div>
        <div className="p-5 justify-self-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
            className="cursor-pointer"
          >
            <Image
              src={clients}
              alt="content"
              quality={75}
              className="drop-shadow-lg"
            />
          </motion.div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between md:flex-row">
        <div className="p-5">
          <div className="">
            <TypeAnimation
              sequence={[
                "Empower your dreams today",
                1500,
                "Financial Security Through Smart Planning",
                1500,
                "Intelligent Investments for Lifelong Security",
                1500,
                "Invest Today for a Stronger Future",
                1500,
              ]}
              speed={60}
              repeat={Infinity}
              wrapper="h1"
              className="text-2xl font-medium md:text-5xl text-primary-700"
            />
          </div>

          <div className="py-4">
            <p className="tracking-wide text-neutral-500">
              Contact Kay Top Multipurpose Investment Limited{" "}
            </p>
            <p className="tracking-wide text-neutral-500">
              to start your financial journey!
            </p>
          </div>
          <div>
            <Link
              href={ROUTES.User.Auth.LOGIN}
              className="px-4 py-2 text-base font-medium bg-primary-300 text-primary hover:text-white relative  rounded-sm 
                       overflow-hidden transition-all duration-300
                       before:content-[''] before:absolute before:top-0 before:left-0
                       before:w-0 before:h-full before:bg-white/30
                       before:transition-all before:duration-300
                       hover:before:w-full w-92 flex flex-col text-center"
            >
              Get Started
            </Link>
          </div>

        </div>
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
            className="cursor-pointer"
          >
            <Image
              src={doubleiphone}
              alt="content"
              quality={75}
              className="drop-shadow-lg"
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}
