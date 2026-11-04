"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { SmoothScroll } from "@/lib/scroll";
import { useCart, usePrefs } from "@/lib/store";
import { CartDrawer } from "./CartDrawer";
import { Checkout } from "./Checkout";
import { HelpOverlay, MapRail, Onboarding, ScrollAnchor, Shortcuts } from "./Chrome";
import { FilterDock } from "./FilterDock";
import { Cursor, FlightLayer, Ripples, Toasts } from "./Fx";
import { ProductOverlay } from "./ProductOverlay";
import { SearchOverlay } from "./SearchOverlay";
import { Summoner } from "./Summoner";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // persisted stores load after hydration so server and client HTML match
    useCart.persist.rehydrate();
    usePrefs.persist.rehydrate();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        {children}
        <MapRail />
        <FilterDock />
        <Summoner />
        <Ripples />
        <ProductOverlay />
        <CartDrawer />
        <SearchOverlay />
        <Checkout />
        <HelpOverlay />
        <Onboarding />
        <Toasts />
        <FlightLayer />
        <Shortcuts />
        <ScrollAnchor />
        <Cursor />
      </SmoothScroll>
    </MotionConfig>
  );
}
