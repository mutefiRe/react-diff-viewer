const path = require('path');
const fs = require('fs');
const sass = require('sass');

const writeFileAsync = (filepath, data, options) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const main = async () => {
  const [light, dark] = await Promise.all([
    sass.compileAsync('./src/light.scss'),
    sass.compileAsync('./src/dark.scss'),
  ]);

  const outputPath = path.resolve(__dirname, 'lib');

  return Promise.all([
    writeFileAsync(path.resolve(outputPath, 'light.css'), light.css, 'utf-8'),
    writeFileAsync(path.resolve(outputPath, 'dark.css'), dark.css, 'utf-8'),
  ]);
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
