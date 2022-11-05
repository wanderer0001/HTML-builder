const { copyFile, readdir, rm, readFile, writeFile } = require('node:fs/promises');
const { mkdir, createWriteStream, createReadStream } = require('node:fs');
const fs = require('fs');
const path = require('node:path');
const { join, extname } = require('node:path');

// Helpers
async function getFilesInDir(path) {
  const files = await readdir(path, 'utf-8');

  return files;
}


async function changeHtml() {
  const projectDistFolder = join(__dirname, 'project-dist');

  let template = await readFile(join(__dirname, 'template.html'), 'utf-8');
  const components = (await getFilesInDir(join(__dirname, 'components')));

  for await (let component of components) {
    let result = await (await readFile(join(__dirname, 'components', component), 'utf-8'));
    const regex = new RegExp(`{{${path.basename(component, 'html')}}`, `gi`);

    template = template.replace(regex, result);
  }

  writeFile(join(projectDistFolder, 'index.html'), template)
}
changeHtml()

async function bundleCss() {
  const bundle = createWriteStream(join(__dirname, 'project-dist', 'style.css'));

  function getBundleCSS() {
    async function readDir() {
      try {
        const files = await readdir(join(__dirname, 'styles'), { withFileTypes: true });
        return files;
      } catch (err) {
        console.error(err);
      }
    }
    const resultFiles = readDir();

    resultFiles
      .then((data) => data.filter(file => extname(file.name) === '.css').map(file => file.name))
      .then(cssFile => {
        for (let file of cssFile) {
          const readStream = createReadStream(join(__dirname, 'styles', file), 'utf-8');
          readStream.on('data', data => bundle.write(data))
        }
      })
  }

  getBundleCSS()
}
bundleCss()

function copyAssets() {
  // Удаление папки 'Assets' из итоговой сборки
  async function updateCopyDir() {
    const pathRemoveFolder = join(__dirname, 'project-dist', 'assets');
    const result = await rm(pathRemoveFolder, { force: true, recursive: true });
    return result;
  }

  // Создание папки 'Assets' в итоговой сборке
  async function makeDir(folderName = join(__dirname, 'project-dist', 'assets')) {
    return mkdir(folderName, { recursive: true }, (err) => {
      if (err)
        throw err;
    });
  }

  async function readDir(dir) {
    try {
      const files = await readdir(dir, { withFileTypes: true });
      return files;
    } catch (err) {
      console.error(err);
    }
  }


  async function copyDirFiles(dir) {
    let srcPath = join(__dirname, 'assets');
    let distPath = join(__dirname, 'project-dist', 'assets');
    for (let file of dir) {
      srcPath = join(__dirname, 'assets');
      distPath = join(__dirname, 'project-dist', 'assets');

      if (file.isFile()) {
        copyFile(join(srcPath, file.name), join(distPath, file.name));
      } else {
        if (file.isDirectory()) {
          fs.readdir(join(__dirname, 'assets', file.name), {withFileTypes: true}, (err, newDirFiles) => {
            if(err) throw err;
            fs.mkdir(path.join(distPath, file.name), err => err);
          
            for(let newFile of newDirFiles) {
              copyFile(join(srcPath, file.name, newFile.name), join(distPath, file.name, newFile.name));
            }
          })

        }
      }
    }
  }

  updateCopyDir()
    .then(makeDir)
    .then(() => readDir(join(__dirname, 'assets')))
    .then((res) => copyDirFiles(res))
    .catch(err => err)
}

copyAssets();
