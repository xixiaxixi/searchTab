const startTime = new Date().getTime();
console.log("zipToExt.js: Start");

console.log("1. Copy manifest.json to dist folder...");
const fs = require("fs");
fs.copyFileSync("src/manifest.json", "dist/manifest.json");

console.log("2. zip dist folder...");
const archiver = require("archiver");
const targetPath = "output/dist.zip";
// make sure output folder exists
if (!fs.existsSync("output")) {
    fs.mkdirSync("output");
}
const output = fs.createWriteStream(targetPath);
const archive = archiver("zip", {
    zlib: {level: 9} // Sets the compression level.
});
output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log("archiver has been finalized and the output file descriptor has closed.");
});
archive.on("error", function (err) {
    console.error(err);
    throw err;
});
archive.pipe(output);
archive.directory("dist/", false);
archive.finalize();
const endTime = new Date().getTime();
console.log(`zipToExt.js: End (${endTime - startTime}ms)`);
