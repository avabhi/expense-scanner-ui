"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./providers/QueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
