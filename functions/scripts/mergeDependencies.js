const fs = require('fs/promises');
const path = require('path');

fs.access(
  path.resolve(__dirname, '..', 'src', 'private-commands', 'package.json'),
  fs.constants.R_OK,
)
  .then(async () => {
    const privatePackage = JSON.parse(
      (
        await fs.readFile(path.resolve(__dirname, '..', 'src', 'private-commands', 'package.json'))
      ).toString(),
    );
    const rootPackage = JSON.parse(
      (await fs.readFile(path.resolve(__dirname, '..', 'package.json'))).toString(),
    );
    const rootDeps = rootPackage.dependencies;
    const filteredPrivateDeps = Object.entries(privatePackage.dependencies).filter(
      ([name, version]) => !rootDeps[name] || rootDeps[name] !== version,
    );
    const mergedDeps = {
      ...rootDeps,
      ...filteredPrivateDeps.reduce((acc, [name, version]) => ({ ...acc, [name]: version }), {}),
    };
    await fs.rename(
      path.resolve(__dirname, '..', 'package.json'),
      path.resolve(__dirname, '..', 'package-temp.json'),
    );
    await fs.rename(
      path.resolve(__dirname, '..', 'package-lock.json'),
      path.resolve(__dirname, '..', 'package-lock-temp.json'),
    );
    await fs.writeFile(
      path.resolve(__dirname, '..', 'package.json'),
      JSON.stringify({
        ...rootPackage,
        dependencies: mergedDeps,
      }),
    );
  })
  .catch(() => {});
