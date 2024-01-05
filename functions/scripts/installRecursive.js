const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const root = process.cwd();
installRecursive(root);

function installRecursive(folder) {
  console.log('installRecursive: ', folder);
  const hasPackageJson = fs.existsSync(path.join(folder, 'package.json'));

  if (hasPackageJson && folder !== root) {
    npmInstall(folder);
  }

  for (const subfolder of subfolders(folder)) {
    installRecursive(subfolder);
  }
}

function npmInstall(where) {
  child_process.execSync('npm install --save', { cwd: where, env: process.env, stdio: 'inherit' });
}

function subfolders(folder) {
  return fs
    .readdirSync(folder)
    .filter(subfolder => fs.statSync(path.join(folder, subfolder)).isDirectory())
    .filter(subfolder => subfolder !== 'node_modules' && subfolder[0] !== '.')
    .map(subfolder => path.join(folder, subfolder));
}
