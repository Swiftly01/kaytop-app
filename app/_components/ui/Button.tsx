import React from "react";

type AppProps = {
  width?: string
}

export default function Button({width = ""}: AppProps) {
  return (
    <button
      className={`${width} relative px-4 py-1.5 rounded-md text-secondary bg-accent
                       overflow-hidden transition-all duration-300
                       before:content-[''] before:absolute before:top-0 before:left-0
                       before:w-0 before:h-full before:bg-white/30
                       before:transition-all before:duration-300
                       hover:before:w-full hover:text-white cursor-pointer`}
    >
      Get Started
    </button>
  );
}
