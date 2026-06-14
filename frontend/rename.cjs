const fs = require("fs");
const path = require("path");

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".jsx") || file.endsWith(".js")) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk("src");

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  let newContent = content.replace(/QuickBot/g, "Aria").replace(/Quickbot/g, "Aria").replace(/quickbot/g, "Aria");
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, "utf8");
  }
});
console.log("Done");
