'use server';

import { cookies } from "next/headers";
import type { User } from "./definitions";

export async function createSession(user: User) {
  (await cookies()).set("session", JSON.stringify(user), {
    httpOnly: false, // 🔥 PRECISA ser false p/ acessar no client
    secure: false,
    path: "/",
  });
}

export async function getSession(): Promise<User | null> {
  const raw = (await cookies()).get("session")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete("session");
}
