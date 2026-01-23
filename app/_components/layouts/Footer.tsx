import React, { JSX } from "react";
import hand from "@/public/hand.svg";
import facebook from "@/public/facebook.svg";
import github from "@/public/github.svg";
import linkedin from "@/public/linkedin.svg";
import twitter from "@/public/twitter.svg";
import web from "@/public/web.svg";
import Image from "next/image";
import Logo from "../ui/Logo";

export default function Footer(): JSX.Element {
  return (
    <footer className="mt-20 text-white bg-primary-700">
      <div className="container px-5 mx-auto py-14">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-semibold md:text-3xl">
            Contact Information
          </h1>
          <p className="mt-2 text-sm md:text-lg opacity-90">
            Apply in minutes. Get approved in 24 hours.
          </p>
        </div>

        <div className="mt-6 mb-8 border-b border-accent"></div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <Logo />
            <p className="pr-4 mt-6 text-sm leading-relaxed opacity-80">
              Simple, secure loans designed to help your business grow with
              confidence. Fast approvals, flexible options, and seamless
              support.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="mb-2 text-lg font-semibold">Quick Links</h3>
            <a href="#mission" className="transition opacity-80 hover:opacity-100">
              About Us
            </a>
            <a href="#services" className="transition opacity-80 hover:opacity-100">
              Services
            </a>
            {/* <a href="#" className="transition opacity-80 hover:opacity-100">
              FAQs
            </a> */}
            {/* <a href="#" className="transition opacity-80 hover:opacity-100">
              Support
            </a> */}
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold">Get the App</h3>

            <div className="flex gap-4 mb-6">
              <a
                href="#"
                className="relative inline-block px-4 py-2 overflow-hidden transition border rounded-md border-primary-300 bg-primary-700 group"
              >
                <span className="absolute inset-0 w-0 h-full transition-all duration-300 bg-white/20 group-hover:w-full"></span>

                <div className="relative z-10 flex items-center">
                  <img src="appleLogo.svg" alt="apple" />
                  <div className="ml-2 leading-tight">
                    <p className="text-xs opacity-80">Download on the</p>
                    <p className="text-sm font-medium">App Store</p>
                  </div>
                </div>
              </a>

              <a
                href="#"
                className="relative inline-block px-4 py-2 overflow-hidden transition border rounded-md border-primary-300 bg-primary-700 group"
              >
                <span className="absolute inset-0 w-0 h-full transition-all duration-300 bg-white/20 group-hover:w-full"></span>

                <div className="relative z-10 flex items-center">
                  <img src="googleplaylogo.svg" alt="google play" />
                  <div className="ml-2 leading-tight">
                    <p className="text-xs opacity-80">Get it on</p>
                    <p className="text-sm font-medium">Google Play</p>
                  </div>
                </div>
              </a>
            </div>

            <ul className="flex items-center gap-5">
              {[twitter, linkedin, facebook, github, hand, web].map(
                (icon, i) => (
                  <li
                    key={i}
                    className="p-2 transition-all duration-300 rounded-full cursor-pointer hover:scale-110 hover:bg-accent/10 hover:border hover:border-primary-300"
                  >
                    <Image src={icon} width={20} height={20} alt="icon" />
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 mb-4 border-b border-accent"></div>

        <div className="flex flex-col items-center justify-between text-sm md:flex-row opacity-80">
          <p>© Kaytop. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Powered by Kaytop Digital</p>
        </div>
      </div>
    </footer>
  );
}
