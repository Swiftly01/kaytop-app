import Image from "next/image";
import subcontent from "@/public/subcontent.png";
import iphone from "@/public/iPhone.svg";
import { motion } from "framer-motion";
import React, { JSX } from "react";

export default function Service(): JSX.Element {
  return (
    <div id="services" className="px-5 text-white rounded-[25px] bg-primary-700">
      <div className="flex flex-col items-center justify-between md:flex-row">
        <div>
          <h1 className="px-8 pt-5 text-lg font-medium text-center md:text-3xl md:text-left">
            Main Services
          </h1>

          <ul className="px-12 space-y-3 leading-8 list-disc text-md md:text-lg md:leading-12">
            {[
              "Micro and SME Loans",
              "Savings and Deposit Accounts",
              "Investment Opportunities",
              "Financial Advisory and Empowerment Programs",
              "Business Support and Growth Financing",
            ].map((item, i) => (
              <li
                key={i}
                className="
              relative cursor-pointer 
              hover:text-primary-300 transition-colors duration-300
              after:content-[''] after:absolute after:left-0 after:-bottom-1
              after:w-0 after:h-[2px] after:bg-accent
              after:transition-all after:duration-300 hover:after:w-full
            "
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
            className="hidden cursor-pointer md:block"
          >
            <Image
              src={subcontent}
              alt="content"
              quality={75}
              className="drop-shadow-lg"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
            className="cursor-pointer md:hidden"
          >
            <Image
              src={iphone}
              alt="content"
              quality={75}
              className="rounded-lg"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
