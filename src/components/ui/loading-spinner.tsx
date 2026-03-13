"use client";

import React from "react";
import { Sparkles, Heart, Leaf, Flower } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ size = "md", text = "Loading..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const containerClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      <div className="relative">
        {/* Main spinning circle */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin`}></div>
        
        {/* Floating icons */}
        <div className="absolute inset-0 animate-pulse">
          <Sparkles className="absolute -top-2 -right-2 h-3 w-3 text-emerald-500 animate-bounce" style={{ animationDelay: '0s' }} />
          <Heart className="absolute -bottom-2 -left-2 h-3 w-3 text-teal-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
          <Leaf className="absolute -top-2 -left-2 h-3 w-3 text-blue-500 animate-bounce" style={{ animationDelay: '1s' }} />
          <Flower className="absolute -bottom-2 -right-2 h-3 w-3 text-emerald-400 animate-bounce" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>
      
      {text && (
        <p className="text-sm text-slate-600 font-inter animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Large spinning gradient circle */}
          <div className="h-20 w-20 rounded-full border-4 border-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 animate-spin mx-auto"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 rounded-full"></div>
          
          {/* Center logo or icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-gradient-peacock mb-2 animate-gradient-shift">
          प्रतिपल
        </h2>
        <p className="text-slate-600 font-script animate-pulse">
          Loading your healing journey...
        </p>
      </div>
    </div>
  );
}