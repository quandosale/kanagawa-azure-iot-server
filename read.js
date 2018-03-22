var file = '5aa64c735753861910ba300d_1521689830838';
var fs = require('fs');
const config = require('./config');
const FILE_TYPE = config.FILE_TYPE;
fs.readFile(`./${config.STORAGE_TMP_PATH}/${file}${FILE_TYPE.AF}`, (data, err) => {
    if (err) throw err;
    console.log(data)
});