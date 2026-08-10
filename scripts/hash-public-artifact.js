const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_ARTIFACT = path.join(ROOT, '_site');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function collectFiles(root, current = root) {
  const files = [];
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(root, absolute));
    if (entry.isFile()) files.push(absolute);
  }
  return files.sort((left, right) =>
    path.relative(root, left).replace(/\\/g, '/').localeCompare(
      path.relative(root, right).replace(/\\/g, '/'),
      'en'
    )
  );
}

function buildReceipt(artifactPath) {
  const resolved = path.resolve(artifactPath);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new Error(`Artifact directory does not exist: ${resolved}`);
  }

  const files = collectFiles(resolved).map(absolute => {
    const bytes = fs.readFileSync(absolute);
    return {
      path: path.relative(resolved, absolute).replace(/\\/g, '/'),
      bytes: bytes.length,
      sha256: sha256(bytes)
    };
  });
  const treeInput = files.map(file => `${file.sha256}  ${file.path}\n`).join('');
  return {
    schemaVersion: '1.0.0',
    algorithm: 'sha256(sorted "<file-sha256>  <posix-relative-path>\\n")',
    artifact: path.relative(ROOT, resolved).replace(/\\/g, '/') || '.',
    fileCount: files.length,
    totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
    treeSha256: sha256(Buffer.from(treeInput, 'utf8')),
    files
  };
}

function main() {
  const artifact = process.argv[2] || DEFAULT_ARTIFACT;
  const output = process.argv[3];
  const receipt = buildReceipt(artifact);
  const serialized = `${JSON.stringify(receipt, null, 2)}\n`;
  if (output) {
    const destination = path.resolve(output);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, serialized, 'utf8');
  }
  console.log(JSON.stringify({
    artifact: receipt.artifact,
    fileCount: receipt.fileCount,
    totalBytes: receipt.totalBytes,
    treeSha256: receipt.treeSha256,
    receipt: output ? path.relative(ROOT, path.resolve(output)).replace(/\\/g, '/') : null
  }));
}

if (require.main === module) main();

module.exports = { buildReceipt };
