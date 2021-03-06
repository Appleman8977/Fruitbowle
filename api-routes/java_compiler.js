const {exec, execFile} = require('child_process');
const express = require('express');
const fs = require('fs');
const router = express.Router();

const topFolder = "javacompiler";

router.get('/isUser', async function (req, res) {
    let userExists = false;

    if(req.user)
        userExists = true;

    return res.status(200).json({
        isUser: userExists
    });
});

router.post('/submit', async function (req, res) {

    applyTempName(req);
    let folders = getUserFolders(req.user);
    let files = req.body.files;
    for(let i = 0; i < files.length; i++){
        let file = files[i];
        if(!javaCodeIsValid(file.contents))
            return res.status(406).json({
                success: false
            });

        fs.writeFileSync(`${folders.source}/${file.filename}`, file.contents);
    }

    return res.status(200).json({
        success: true
    });
});

router.get('/load', async function (req, res) {

    applyTempName(req);
    let folders = getUserFolders(req.user);
    let fileObjects = [];
    let files = fs.readdirSync(folders.source);
    for(let i = 0; i < files.length; i++)
        fileObjects.push({filename: files[i], contents: fs.readFileSync(`${folders.source}/${files[i]}`, 'utf8')});

    return res.status(200).json({
        files: fileObjects
    });

});

router.post('/compile', async function (req, res) {

    applyTempName(req);
    const javaCompile = "javac";
    let folders = getUserFolders(req.user);

    exec(`${javaCompile} -d ${windowsFiles(folders.binary)} ${windowsFiles(folders.source)}/*.java`, {timeout: 10000},(error, stdout, stderr) =>{
        res.status(200).json({
            cmdOut: stdout,
            error: error,
            cmdErr: stderr,
        });
    });
});

router.post('/run', async function (req, res) {
    applyTempName(req);
    const javaRun = "java";
    let folders = getUserFolders(req.user);

    exec(`${javaRun} ${req.body.main}`, {cwd : folders.binary, timeout: 10000},(error, stdout, stderr) =>{
        res.status(200).json({
            cmdOut: stdout,
            error: error,
            cmdErr: stderr,
        });
    });
});

function javaCodeIsValid(text){
    const invalidImport = /import\s/;

    if(invalidImport.test(text))
        return false;

    return true;
}

function windowsFiles(path){
    return path;//.replace(/\//g, '\\');
}

function getUserFolders(user){
    let userid = user.id;
    establishBaseFolder();
    let userFolder = `${topFolder}/${userid}`;
    let sourceFolder = `${userFolder}/src`;
    let binaryFolder = `${userFolder}/bin`;

    if(!fs.existsSync(userFolder)){
        fs.mkdirSync(userFolder);
        fs.mkdirSync(sourceFolder);
        fs.mkdirSync(binaryFolder);
    }
    return {base: userFolder,
            source: sourceFolder,
            binary: binaryFolder};
}

function establishBaseFolder(){
    if(!fs.existsSync(topFolder))
        fs.mkdirSync(topFolder);
}

function applyTempName(req){
    if(!req.user) {
        req.user = {id: encodeURIComponent(req.body.tempUsername)};
    }
}

module.exports = router;