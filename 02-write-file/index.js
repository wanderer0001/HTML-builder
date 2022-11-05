const fs = require('fs');
const path = require('path');
const { stdin, stdout, error } = require('process');

const writeableStream = fs.createWriteStream(path.join(__dirname, 'result.txt'), 'utf-8');

stdout.write('Приветствую. \nВведите данные для добавления в файл result.txt\n');
stdin.on('data', data => {
    let isExit = (/exit/gi).test(data.toString());
    if (isExit) {
        stdout.write('Пока!')
        process.exit();
    };
    writeableStream.write(data);
})