"use client"

import React from "react"

export default function Dashboard() {
    return (
        <div className="custom-bg min-h-screen py-3 px-3">
            <div className="px-3">
                <a href="http://localhost:3000/">
                    <h1
                        className="cursor-pointer font-bold text-left text-6xl bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 
                        bg-clip-text text-transparent inline-block transition-all duration-300 ease-in-out hover:scale-[1.03] hover:from-indigo-500 hover:via-fuchsia-500 hover:to-orange-400"
                    >
                        Lazy
                    </h1>
                </a>
            </div>
        </div>
    )
}