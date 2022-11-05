const { readdir } = require('node:fs/promises');
const {createReadStream, createWriteStream } = require('node:fs');
const path = require('path');

const bundle = createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));

function getBundleCSS() {
  async function readDir() {
    try {
      const files = await readdir(path.join(__dirname, 'styles'), { withFileTypes: true });
      return files;
    } catch (err) {
      console.error(err);
    }
  }
  const resultFiles = readDir();

  resultFiles
  .then((data) => data.filter(file => path.extname(file.name) === '.css').map(file => file.name))
  .then(cssFile => {
    for(let file of cssFile) {
      const readStream = createReadStream(path.join(__dirname, 'styles', file), 'utf-8');
      readStream.on('data', data => bundle.write(data))
    }
  })
}

getBundleCSS()