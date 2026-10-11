"use client";

import { useCallback, useEffect, useState } from "react";
import { cleanAlphabet } from "./morse";

const KEY = "tsegzuraas.alphabet";

/**
 * Write, Listen, Score хуудсуудын English/Монгол горим. Сонголтыг браузерт
 * санаж, хуудас хооронд хадгална.
 *
 * Буцаах: [alphabet, setAlphabet, ready]. ready нь хадгалсан утгыг уншиж
 * дууссан эсэх — түүнээс өмнө өгөгдөл татвал эхлээд англи, дараа нь монгол
 * горимоор хоёр удаа ачаална.
 */
export default function useAlphabet() {
  const [alphabet, setAlphabetState] = useState("english");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setAlphabetState(cleanAlphabet(window.localStorage.getItem(KEY)));
    } catch {
      /* localStorage байхгүй бол англи горимоор эхэлнэ */
    }
    setReady(true);
  }, []);

  const setAlphabet = useCallback((value) => {
    const next = cleanAlphabet(value);
    setAlphabetState(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* хадгалж чадахгүй бол зөвхөн энэ хуудсанд үйлчилнэ */
    }
  }, []);

  return [alphabet, setAlphabet, ready];
}
