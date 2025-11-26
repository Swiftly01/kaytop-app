import { motion, useInView } from "framer-motion";
import { JSX, useRef } from "react";
import Image from "next/image";
import React from "react";
import { TypeAnimation } from "react-type-animation";
import hero from "@/public/hero.png";

export default function Hero(): JSX.Element {  
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.75 });

  return (
    <div className="flex flex-col items-center justify-between md:flex-row">
      <div className="text-center md:text-left">
        <a
          href=""
          className="inline-block my-2 relative px-2 py-2 border rounded-full border-secondary text-secondary
             overflow-hidden transition-all duration-300
             before:content-[''] before:absolute before:top-0 before:left-0
             before:w-0 before:h-full before:bg-white/30
             before:transition-all before:duration-300
             hover:before:w-full
             hover:bg-accent hover:text-secondary cursor-pointer group"
        >
          <span className="px-2 mr-2 border rounded-full border-secondary">
            Trusted!
          </span>
          Empowering Every Dream
          <span className="inline-block mr-1 transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>
        <TypeAnimation
          sequence={[
            "Empowering Every Dream",
            1500,
            "Building Wealth With Confidence",
            1500,
            "Smart Investments for a Secure Future",
            1500,
            "Your Journey to Financial Freedom Starts Here",
            1500,
          ]}
          speed={60}
          repeat={Infinity}
          wrapper="h1"
          className="text-2xl font-semibold md:text-5xl text-secondary"
        />
        <div className="my-3">
          <p className="text-lg tracking-wide text-text">
            Designed for everyday people. Quick loans with fair rates and
          </p>
          <p className="text-lg tracking-wide text-text">
            flexible terms to help you grow your business or handle life&apos;
            needs.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 my-5 md:justify-normal">
          <a
            href=""
            className="relative inline-block pl-1 pr-3 py-1.5 text-white rounded-md bg-gray-950
               overflow-hidden transition-all duration-300
               before:content-[''] before:absolute before:top-0 before:left-0
               before:w-0 before:h-full before:bg-white/20
               before:transition-all before:duration-300
               hover:before:w-full hover:bg-accent hover:text-secondary"
          >
            <div className="relative z-10 flex items-center">
              <img src="appleLogo.svg" alt="apple logo" />
              <div className="ml-2 leading-none">
                <p className="text-sm leading-none">Download on the</p>
                <p>App Store</p>
              </div>
            </div>
          </a>

          <a
            href=""
            className="relative inline-block pl-2.5 pr-6 py-1.5 text-white rounded-md bg-gray-950
               overflow-hidden transition-all duration-300
               before:content-[''] before:absolute before:top-0 before:left-0
               before:w-0 before:h-full before:bg-white/20
               before:transition-all before:duration-300
               hover:before:w-full hover:bg-accent hover:text-secondary"
          >
            <div className="relative z-10 flex items-center">
              <img src="googleplaylogo.svg" alt="google play logo" />
              <div className="ml-2 leading-none">
                <p className="text-sm leading-none">Get it on</p>
                <p>Google Play</p>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div>
        <motion.div
          ref={ref}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 1 }}
          className="cursor-pointer"
        >
          <Image
            src={hero}
            alt="Hero image"
            quality={75}
            className="rounded-lg"
          />
        </motion.div>
      </div>
    </div>
  );
}
