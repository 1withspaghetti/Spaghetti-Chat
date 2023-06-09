import { AuthContext } from "@/context/AuthContext";
import axios, { AxiosError } from "axios";
import { Metadata } from "next";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import AuthProvider from "./AuthProvider";

import '../styles/globals.css'

export const metadata: Metadata = {
    title: 'Spaghetti Chat',
    description: 'TODO',
}

const poppins = Poppins({weight: ["400","600","700"], subsets: ["latin-ext"]})

export default function Layout({ children }: { children: React.ReactNode}) {
    return (
        <AuthProvider>
            <html lang="en" className={"dark "+poppins.className}>
                <body>
                {children}
                </body>
            </html>
        </AuthProvider>
    )
  }