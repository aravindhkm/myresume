import { generateHtml } from "./generateHtml";
import { writeFileSync } from "fs";

(async () => {
    console.error("🚀 Running resume generator...");
    const html = await generateHtml();
    writeFileSync("dist/resume.html", html);
    console.error("✅ Resume written to dist/resume.html");
})();
