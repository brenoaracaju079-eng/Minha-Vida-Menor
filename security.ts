"use client";
const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export const bioSupported = () => typeof window !== "undefined" && !!window.PublicKeyCredential && !!navigator.credentials;

export async function registerBiometric(): Promise<string> {
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Minha Vida Menor" },
      user: { id: crypto.getRandomValues(new Uint8Array(16)), name: "usuario", displayName: "Usuário" },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("cancelado");
  return b64(cred.rawId);
}

export async function unlockBiometric(credId: string): Promise<boolean> {
  try {
    const r = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: "public-key", id: unb64(credId) }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return !!r;
  } catch {
    return false;
  }
}
