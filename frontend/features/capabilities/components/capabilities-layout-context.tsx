"use client";

import * as React from "react";

export interface CapabilitiesLayoutContextValue {
  isMobileDetail: boolean;
  onMobileBack?: (() => void) | null;
  mobileBackLabel?: string;
}

const CapabilitiesLayoutContext =
  React.createContext<CapabilitiesLayoutContextValue>({
    isMobileDetail: false,
    onMobileBack: null,
    mobileBackLabel: undefined,
  });

interface CapabilitiesLayoutProviderProps {
  value: CapabilitiesLayoutContextValue;
  children: React.ReactNode;
}

export function CapabilitiesLayoutProvider({
  value,
  children,
}: CapabilitiesLayoutProviderProps) {
  return (
    <CapabilitiesLayoutContext.Provider value={value}>
      {children}
    </CapabilitiesLayoutContext.Provider>
  );
}

export function useCapabilitiesLayoutContext(): CapabilitiesLayoutContextValue {
  return React.useContext(CapabilitiesLayoutContext);
}
