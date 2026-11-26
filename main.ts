import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "You edited the prompt twice while I was answering the first version — so I shipped a perfect answer to a question you deleted, about a file you renamed, for a deadline you moved.";

const MAX_CHARS = 200;

function validate(line: string): void {
  if (typeof line !== "string" || line.length === 0) {
    throw new Error("entry line must be a non-empty string");
  }
  if (line.length > MAX_CHARS) {
    throw new Error(`entry line is ${line.length} chars; limit is ${MAX_CHARS}`);
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line without newlines");
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (line !== line.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  // The scorer reads UTF-8 text; make sure the line survives a byte round-trip.
  if (Buffer.from(line, "utf8").toString("utf8") !== line) {
    throw new Error("entry is not valid UTF-8 round-trippable text");
  }
}

function main(): void {
  validate(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, LINE, "utf8");
  const readBack = readFileSync(target, "utf8");
  if (readBack !== LINE) {
    throw new Error("read-back verification failed: written bytes differ");
  }
  const sha = createHash("sha256").update(readBack, "utf8").digest("hex");
  console.log(`wrote ${target} (${readBack.length} chars)`);
  console.log(`sha256 ${sha}`);
}

main();
