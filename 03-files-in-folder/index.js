const fs = require('fs');
const path = require('path');

function createPath(filename = '', folder = 'secret-folder',) {
    const pathName = path.join(__dirname, folder, filename);
    return pathName;
}

function createSize(files) {
    for(let i = 0; i < files.length; i++) {
            
        fs.stat(createPath(files[i].name), (err, stat) => {
            if (err) throw err;
            console.log(`${path.basename(files[i].name, path.extname(files[i].name))} - ${path.extname(files[i].name).slice(1)} - ${stat.size * 0.001}kb`)
        })
    }
}

fs.readdir(createPath(), { withFileTypes: true, encoding: 'utf-8' }, (err, files) => {
    new Promise(function (resolve, reject) {
        if (err) reject(new Error(err.message))
        else {
            resolve(files.filter(file => !file.isDirectory()))
        }
    }).then(withoutDir => {
        createSize(withoutDir);
    })
})
