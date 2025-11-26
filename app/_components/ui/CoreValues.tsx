import chat from "@/public/chat.svg";
import content from "@/public/content.svg";
import customer from "@/public/customer.svg";
import iphone from "@/public/iPhone.svg";
import lightning from "@/public/lightning.svg";
import smile from "@/public/smile.svg";
import { motion } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { JSX } from "react";

interface CoreValue {
  icon: StaticImageData;
  title: string;
  content: string;
}

const data: CoreValue[] = [
  {
    icon: chat,
    title: "Integrity",
    content: "We maintain transparency and honesty in all operations.",
  },
  {
    icon: lightning,
    title: "Empowerment",
    content: "We support financial independence and self-reliance.",
  },
  {
    icon: customer,
    title: "Customer",
    content: "Our clients are the center of all decisions.",
  },
  {
    icon: smile,
    title: "Innovation",
    content: "We embrace technology and new ideas to improve lives.",
  },
  {
    icon: customer,
    title: "Accountability",
    content: "We uphold responsibility and excellence in service.",
  },
  {
    icon: smile,
    title: "Teamwork",
    content: "We believe in collaboration and shared success.",
  },
];

export default function CoreValues(): JSX.Element {
  return (
    <div>
      <h1 className="px-5 text-lg font-medium text-center md:text-left text-primary">
        Core Values
      </h1>
      <div className="flex flex-col justify-between gap-10 p-5 md:items-start md:flex-row">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-25 md:gap-y-10">
            {data.map((item, i) => (
              <div
                key={i}
                className="cursor-pointer p-5 rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:bg-white border border-transparent hover:border-accent"
              >
                <Image src={item.icon} quality={75} alt="chat icon" />
                <h1 className="mt-5 font-medium text-primary">{item.title}</h1>
                <p className="text-text">{item.content}</p>
              </div>
            ))}
          </div>
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
              src={content}
              alt="content"
              quality={75}
              className="rounded-lg"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image
              src={iphone}
              alt="content"
              quality={75}
              className="block mx-auto cursor-pointer md:hidden"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
