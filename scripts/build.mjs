// Produces dist/ containing static files only, ready for any static web server.
// Validation of the question bank (issue #2) will be hooked in here so that bad data fails the build.
import { cp, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await cp("src", "dist", { recursive: true });
console.log("Built static files into dist/");
