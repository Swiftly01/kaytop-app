"use client";
import Clients from "./_components/ui/Clients";
import CoreValues from "./_components/ui/CoreValues";
import Hero from "./_components/ui/Hero";
import Investment from "./_components/ui/Investment";
import Mission from "./_components/ui/Mission";
import Service from "./_components/ui/Service";

export default function Home() {
  return (
    <>
      <main className="container mx-auto mt-12">
        <Hero />
        <Mission />
        <CoreValues />
        <Service />
        <Investment />
        <Clients />
      </main>
    </>
  );
}
