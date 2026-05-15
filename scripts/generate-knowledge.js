const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'app', 'lib');
const outputFile = path.join(outputDir, 'knowledgeData.json');

const data = {
  markdowns: [],
  notebooks: [],
  python: []
};

function readFiles(dir, relativeDir, category, extList) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next' && file !== 'public') {
        readFiles(fullPath, path.join(relativeDir, file), category, extList);
      }
    } else {
      const ext = path.extname(file);
      if (extList.includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const item = {
          path: path.join(relativeDir, file).replace(/\\/g, '/'),
          name: file,
          content: content
        };
        category.push(item);
      }
    }
  }
}

// Read root markdowns
const files = fs.readdirSync(rootDir);
for (const file of files) {
    const fullPath = path.join(rootDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory() && file.endsWith('.md')) {
        data.markdowns.push({
            path: file,
            name: file,
            content: fs.readFileSync(fullPath, 'utf-8')
        });
    }
}

// Read notebooks
if (fs.existsSync(path.join(rootDir, 'notebooks'))) {
    readFiles(path.join(rootDir, 'notebooks'), 'notebooks', data.notebooks, ['.ipynb']);
}
// Read GM AI
if (fs.existsSync(path.join(rootDir, 'grandmaster_ai'))) {
    readFiles(path.join(rootDir, 'grandmaster_ai'), 'grandmaster_ai', data.python, ['.py', '.md']);
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
console.log('Knowledge data generated at', outputFile);
