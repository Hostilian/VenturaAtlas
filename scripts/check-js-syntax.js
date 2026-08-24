const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function trackedFiles(pattern) {
  const result = spawnSync('git', ['ls-files', '-z', pattern], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || 'Unable to list tracked files.\n');
    process.exit(result.status || 1);
  }
  return result.stdout.split('\0').filter(Boolean);
}

const failures = [];
const files = trackedFiles('*.js');
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', '--', file], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    failures.push({ file, output: result.stderr || result.stdout });
  }
}

if (failures.length) {
  console.error(`[ERROR] ${failures.length} tracked JavaScript file(s) failed syntax validation.`);
  for (const failure of failures) {
    console.error(`\n${failure.file}\n${failure.output.trim()}`);
  }
  process.exit(1);
}

console.log(`[OK] Parsed ${files.length} tracked JavaScript files.`);
