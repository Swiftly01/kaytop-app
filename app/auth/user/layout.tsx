import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#f3f4ff]">
      
      {/* Diagonal White Section */}
      <div className="absolute inset-0 bg-[#f9fafc] [clip-path:polygon(0%_0%,100%_0%,100%_30%,0%_70%)]" />

      {/* MAIN CONTENT max-w-md md:max-w-xl mx-auto */}
      <div className="relative z-10 w-full pb-8">
        {children}
      </div>
    </div>
  );
}

