import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Single-file PWA-style build, same convention as the other game project:
// `npm run build` produces one self-contained dist/index.html.
export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    target: "esnext",
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
});
