const fs = require('fs/promises');
const path = require('path');

fs.access(path.resolve(__dirname, '..', 'package-temp.json'), fs.constants.R_OK)
  .then(async () => {
    await fs.rename(
      path.resolve(__dirname, '..', 'package-temp.json'),
      path.resolve(__dirname, '..', 'package.json'),
    );
    await fs.rename(
      path.resolve(__dirname, '..', 'package-lock-temp.json'),
      path.resolve(__dirname, '..', 'package-lock.json'),
    );
  })
  .catch(() => {});
