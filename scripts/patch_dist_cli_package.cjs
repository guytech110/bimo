const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../dist/cli/package.json');
try {
  if (!fs.existsSync(pkgPath)) {
    console.log('No dist/cli/package.json found; skipping patch.');
    process.exit(0);
  }
  const raw = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);
  if (pkg.type === 'module') {
    console.log('dist/cli/package.json already has type: module');
    process.exit(0);
  }
  pkg.type = 'module';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('Patched dist/cli/package.json with type: module');
} catch (err) {
  console.error('Failed to patch dist/cli/package.json', err);
  process.exit(1);
}





