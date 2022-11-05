const {copyFile, readdir, rm } = require('node:fs/promises');
const { mkdir } = require('node:fs');
const path = require('node:path');
const { join } = require('node:path');

function updateCopyDir() {
  const pathRemoveFolder = path.join(__dirname, 'files-copy');
  return rm(pathRemoveFolder, { force: true, recursive: true});
}

function makeDir() {
  const folderName = join(__dirname, 'files-copy');
  return mkdir(folderName, { recursive: true }, (err) => {
    if (err) throw err;
  });
}

function readDir(folder = 'files') {
  const folderName = join(__dirname, folder);
  const readResult = readdir(folderName, (err, files) => files)
  return readResult;
}

async function copyDirFiles() {
  const files = await readDir();

  for(let file of files) {
    copyFile(path.join(__dirname, 'files', file), path.join(__dirname, 'files-copy', file))
  }

}

updateCopyDir().then(() => makeDir()).then(() => readDir()).then(() => copyDirFiles())
