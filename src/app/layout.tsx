import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Aku Code",description:"AI coding workspace by Aku Apps"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}