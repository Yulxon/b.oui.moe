import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
process.chdir(root);

let files = [];
try {
  files = execFileSync("git", ["diff", "--name-only", "HEAD", "--", "data"], {encoding:"utf8"}).trim().split("\n").filter(Boolean);
} catch {
  console.log("No Git baseline yet; append-only check skipped.");
  process.exit(0);
}

let failed = false;
for (const file of files) {
  let oldText = "";
  try { oldText = execFileSync("git", ["show", `HEAD:${file}`], {encoding:"utf8"}); } catch { continue; }
  const newText = await fs.readFile(path.join(root, file), "utf8");
  if (!newText.startsWith(oldText)) {
    console.error(`${file}: existing Data bytes were changed or removed; append updates instead.`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(files.length ? `Append-only Data check passed for ${files.length} changed file(s).` : "No Data changes to check.");
