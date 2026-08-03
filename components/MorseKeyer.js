"use client";

import { useEffect, useRef, useState } from "react";
import { REVERSE_MORSE_MAP } from "@/lib/morse";

/**
 * Телеграфын товчлуурын дуулиулалт: Q = Цэг (.), W = Зураас (-)
 * Хэрэглэгч товчлуур дарж морзын код угсарч, зохих зайны дараа тэмдэгт
 * рүү хөрвүүлж decodedText-д нэмнэ.
 *
 * onDecodedChar(char) callback-аар шинэ тэмдэгт бүрийг гадагш дамжуулна.
 */
export default function useMorseKeyer({ enabled, unitMs, onDecodedChar }) {
  const [currentSymbols, setCurrentSymbols] = useState("");
  const bufferRef = useRef("");
  const gapTimerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    function scheduleCharCommit() {
      clearTimeout(gapTimerRef.current);
      // Тэмдэгт хоорондын зай = 3 нэгж гэж үзнэ
      gapTimerRef.current = setTimeout(() => {
        if (bufferRef.current) {
          const char = REVERSE_MORSE_MAP[bufferRef.current] || "?";
          onDecodedChar?.(char);
          bufferRef.current = "";
          setCurrentSymbols("");
        }
      }, unitMs * 3);
    }

    function handleKeyDown(e) {
      const key = e.key.toLowerCase();
      if (key === "q") {
        bufferRef.current += ".";
        setCurrentSymbols(bufferRef.current);
        scheduleCharCommit();
      } else if (key === "w") {
        bufferRef.current += "-";
        setCurrentSymbols(bufferRef.current);
        scheduleCharCommit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(gapTimerRef.current);
    };
  }, [enabled, unitMs, onDecodedChar]);

  return { currentSymbols };
}
