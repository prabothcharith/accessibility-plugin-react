import { copyFile, mkdir } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await copyFile("src/styles/tailwind.css", "dist/style.css");
