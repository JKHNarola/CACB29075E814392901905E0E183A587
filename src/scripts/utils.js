const {
    dialog
} = require('electron').remote;
var fs = require('fs');
var path = require('path');
var mm = require('musicmetadata');

exports.browseFolder = function () {
    const folders = dialog.showOpenDialog({
        title: 'Choose folder',
        properties: ['openDirectory']
    });
    if (!folders) return null;
    return folders;
};

exports.getFilesFromFolder = function (folder) {
    var finalFiles = [];
    if (!folder) {
        var folders = this.browseFolder();
        if (!folders) return finalFiles;
        folder = folders[0];
    }
    var files = this.getFiles(folder);
    files.forEach(function (x) {
        if (path.extname(x).toLowerCase() === ".mp3") finalFiles.push(x);
    });
    return finalFiles;
};

exports.getFiles = function (dir, filelist) {
    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = getFiles(path.join(dir, file), filelist);
        } else {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
};

exports.readId3 = function (file) {
    return new Promise(function (resolve, reject) {
        mm(fs.createReadStream(file), function (err, metadata) {
            if (err)
                reject(err);
            else {
                resolve(metadata);
            }
        });
    });
};