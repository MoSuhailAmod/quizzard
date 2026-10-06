// Produces dist/ containing static files only, ready for any static web server.
// The build fails if the question bank is invalid.
import { cp, rm } from "node:fs/promises";
import { validateBank } from "./validate.mjs";

const errors = await validateBank();
if (errors.length > 0) {
  console.error(`Build stopped: question bank is invalid (${errors.length} problem${errors.length === 1 ? "" : "s"}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

await rm("dist", { recursive: true, force: true });
await cp("src", "dist", { recursive: true });
console.log("Built static files into dist/");
