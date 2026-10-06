// Validates the question bank. Run with `npm run validate`; `npm run build` runs it first.
import { readdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateQuestions } from "../src/data/questions/schema.js";
import { questions, subjectFiles } from "../src/data/questions/index.js";

const questionsDir = fileURLToPath(new URL("../src/data/questions/", import.meta.url));
const infrastructure = new Set(["index.js", "schema.js"]);

/** Returns a list of problems; an empty list means the bank is valid. */
export async function validateBank() {
  const errors = validateQuestions(questions);

  const onDisk = (await readdir(questionsDir)).filter((f) => f.endsWith(".js") && !infrastructure.has(f));
  for (const file of onDisk) {
    if (!subjectFiles.includes(file)) errors.push(`${file} is in the folder but not registered in index.js.`);
  }
  for (const file of subjectFiles) {
    if (!onDisk.includes(file)) errors.push(`${file} is listed in index.js but does not exist.`);
  }

  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = await validateBank();
  if (errors.length > 0) {
    console.error(`Question bank is invalid (${errors.length} problem${errors.length === 1 ? "" : "s"}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`Question bank is valid (${questions.length} question${questions.length === 1 ? "" : "s"}).`);
}
