"use client";

// @ts-expect-error next-themes types mismatch
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { Toaster } from "sonner";
import { ReactNode } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { MaintenanceProvider } from "@/contexts/MaintenanceContext";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <AuthProvider>
                    <MaintenanceProvider>
                        {children}
                        <Toaster />
                    </MaintenanceProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
