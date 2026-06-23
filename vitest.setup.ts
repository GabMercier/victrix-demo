// The app relies on the Web Crypto global (`crypto.subtle`), which exists in
// Cloudflare Workers, in `astro dev`, and in Node 20+. Node 18's bare test
// runtime does NOT expose it, so polyfill it for the test process only.
// (Remove once the project is on Node 20+ — see the roadmap's Node-20 item.)
import { webcrypto } from 'node:crypto';

if (!globalThis.crypto) {
  // @ts-expect-error — assign Node's webcrypto to the global for tests
  globalThis.crypto = webcrypto;
}
