import Image from "next/image";
import image from "@/public/Image.svg";
import mobileimage from "@/public/mobileimage.svg";
import { motion } from "framer-motion";
import React, { JSX } from "react";

export default function Investment(): JSX.Element {
  return (
    <div className="md:p-15 text-white rounded-[25px] bg-secondary mt-15">
      <div className="flex flex-col items-center md:flex-row">
        <div className="order-2 md:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
            className="hidden cursor-pointer md:block"
          >
            <Image
              src={image}
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
            className="py-5 cursor-pointer md:hidden"
          >
            <Image
              src={mobileimage}
              alt="content"
              quality={75}
              className="rounded-lg"
            />
          </motion.div>
        </div>

        <div className="order-1 md:order-2 md:pl-15">
          <h1 className="px-8 pt-5 text-lg font-medium text-center md:text-3xl md:text-left">
            Investment Areas
          </h1>

          <ul className="px-12 space-y-3 leading-8 list-disc text-md md:text-lg md:leading-12">
            {[
              "Agriculture and Agribusiness",
              "Small and Medium Enterprises (SMEs)",
              "Retail and Market Trade",
              "Real Estate and Asset Financing",
              "Technology and Innovation Ventures",
            ].map((item, i) => (
              <li
                key={i}
                className="
              relative cursor-pointer 
              hover:text-accent transition-colors duration-300
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
      </div>
    </div>
  );
}
