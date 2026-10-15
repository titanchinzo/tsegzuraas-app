"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

// Navbar болон layout-ын modal-ууд зэрэг mount болдог тул нэг хүсэлтийг
// хуваалцана — /api/users/me дуудалт бүр Clerk API руу хандадаг.
let inflight = null;

function fetchProfile() {
  if (!inflight) {
    inflight = fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.user || null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

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
    fetchProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  return { profile, role: profile?.role || null, loading, isSignedIn };
}
