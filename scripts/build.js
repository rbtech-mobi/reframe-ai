/**
 * Build script for ReframeIA.
 * Validates TypeScript types, runs the automated test suite,
 * cleans the output directory, and exports production bundles using Expo.
 *
 * Usage:
 *   node scripts/build.js                 # Builds for all platforms (web, iOS, Android)
 *   node scripts/build.js --platform web   # Builds static web distribution only
 *   node scripts/build.js --platform android # Builds Android distribution
 *   node scripts/build.js --platform ios     # Builds iOS distribution
 *   node scripts/build.js --skip-tests    # Skips test suite execution
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");

// Parse command line arguments
const args = process.argv.slice(2);
let platform = "all";
let skipTests = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--platform" && args[i + 1]) {
    platform = args[i + 1];
    i++;
  } else if (args[i] === "--web") {
    platform = "web";
  } else if (args[i] === "--android") {
    platform = "android";
  } else if (args[i] === "--ios") {
    platform = "ios";
  } else if (args[i] === "--skip-tests") {
    skipTests = true;
  }
}

console.log("\n========================================");
console.log("🚀 ReframeIA Production Build Pipeline");
console.log("========================================");
console.log(`Target Platform: ${platform.toUpperCase()}`);
console.log(`Output Directory: ${distDir}\n`);

function runStep(name, command) {
  console.log(`▶ [1/4] Running ${name}...`);
  try {
    execSync(command, { cwd: rootDir, stdio: "inherit" });
    console.log(`✔ ${name} passed successfully.\n`);
  } catch (error) {
    console.error(`\n❌ Failed at step: ${name}`);
    process.exit(1);
  }
}

// 1. TypeScript Verification
runStep("TypeScript Typecheck", "npm run typecheck");

// 2. Automated Tests
if (!skipTests) {
  runStep("Automated Test Suite", "npm run test");
} else {
  console.log("⏩ Skipping tests (--skip-tests active).\n");
}

// 3. Clean dist directory if exists
if (fs.existsSync(distDir)) {
  console.log("🧹 Cleaning previous dist/ directory...");
  fs.rmSync(distDir, { recursive: true, force: true });
}

// 4. Run Expo Export
console.log(`📦 Exporting production bundles for platform: ${platform}...`);
const exportCmd =
  platform === "web"
    ? "npx expo export -p web"
    : `npx expo export -p ${platform} --no-bytecode`;

try {
  execSync(exportCmd, { cwd: rootDir, stdio: "inherit" });
} catch (error) {
  console.error("\n❌ Expo export encountered an error.");
  process.exit(1);
}

// 5. Output Summary
if (fs.existsSync(distDir)) {
  console.log("\n========================================");
  console.log("✨ Build Completed Successfully!");
  console.log("========================================");

  function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        getFiles(fullPath, fileList);
      } else {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const allFiles = getFiles(distDir);
  console.log(`Total Generated Artifacts: ${allFiles.length} files`);

  // Find main JS bundles
  const jsBundles = allFiles.filter((f) => f.endsWith(".js"));
  if (jsBundles.length > 0) {
    console.log("\nGenerated Bundles:");
    for (const bundle of jsBundles) {
      const sizeKb = (fs.statSync(bundle).size / (1024 * 1024)).toFixed(2);
      const rel = path.relative(distDir, bundle);
      console.log(`  - ${rel} (${sizeKb} MB)`);
    }
  }

  console.log(`\nArtifacts ready in: ${distDir}\n`);
}
