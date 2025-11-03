import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import "../assets/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>TimeScope - Gestion Intelligente du Temps</title>
      </Head>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <main className="flex-1 overflow-auto">
            <Component {...pageProps} />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}