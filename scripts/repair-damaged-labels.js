const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['financial-models', 'validation-plans', 'technical-blueprints'];

function fixDictString(line) {
  // We only care about lines containing "{'"
  if (!line.includes("{'")) return line;

  // A regex to replace single quotes that act as Python string boundaries.
  // We match single quotes that are preceded by { [ : , or space, 
  // or followed by } ] : , or space.
  
  // A simpler robust way for these generated strings:
  // Usually the structure is strict: {'key': 'value', 'key2': ...}
  // Let's replace ' with " if it is part of a dict syntax.
  
  let fixed = line.replace(/(?<=[{,:\[\s])'|'(?=[},:\]\s])/g, '"');
  return fixed;
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      
      const newLines = lines.map(line => {
        if (line.includes("{'")) {
          modified = true;
          return fixDictString(line);
        }
        return line;
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, newLines.join('\n'), 'utf8');
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

TARGET_DIRS.forEach(dir => {
  processDirectory(path.join(__dirname, '..', dir));
});

console.log("Repair complete.");
