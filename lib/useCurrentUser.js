"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Одоогийн хэрэглэгчийн MongoDB дахь профайл (role, nickname гэх мэт) -ийг
 * /api/users/me -ээс татаж авна. Clerk-ийн publicMetadata биш, өөрсдийн DB
 * дэх role-г эх сурвалж болгоно (spec §5 users.role).
 */
export default function useCurrentUser() {
  const { isSignedIn } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data?.user || null))
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  return { profile, role: profile?.role || null, loading, isSignedIn };
}
