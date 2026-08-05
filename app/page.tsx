"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RouteSelector } from "@/components/RouteSelector";
import { BookingWizard } from "@/components/BookingWizard";
import { Footer } from "@/components/Footer";
import type { RouteId } from "@/lib/questionnaire";

export default function Home() {
  const [route, setRoute] = useState<RouteId | null>(null);

  function selectRoute(id: RouteId) {
    setRoute(id);
    setTimeout(() => {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function changeRoute() {
    setRoute(null);
    document.getElementById("routes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <RouteSelector value={route} onSelect={selectRoute} />
        <BookingWizard route={route} onChangeRoute={changeRoute} />
      </main>
      <Footer />
    </>
  );
}
