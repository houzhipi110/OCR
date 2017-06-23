Promise = require('Bluebird');
var logger = require('../lib/bunyanLogger');
var gm = require('gm');
var path = require('path');
var fs = require("fs");
var tesseract = require('node-tesseract');

//set options
var options = {
    l: 'eng',  //languguaasdasd
    psm: 6,
    'config': 'digits',
    binary: 'tesseract'
};

function templatecrop(imagedata) {
    return new Promise(function (resolve, reject) {
        var imagebuff = new Buffer(imagedata, 'base64');
        gm(imagebuff).threshold(25, 1).crop(58, 29, 196, 13).resize(300, 200)//segmentations parameters
            //.toBuffer('PNG', function (err, processedBuffer) {
            .write(path.join('./js/temp', 'templateid' + '.png'), function (err) {
                if (!err) {
                    console.log('templateid block crop done');
                    resolve();
                } else {
                    console.log('templateid block crop error');
                    reject(err);
                }
            });
    });
}

function templateidrecog() {
    var tempfilepath = __dirname + '/temp/templateid' + '.png';
    console.log(__dirname);
    return new Promise(function (resolve, reject) {
        fs.exists(tempfilepath, function (exists) {
            tesseract.process(tempfilepath, options, function (err, text) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log('Recognize results:' + text);
                    if (text.trim()) {
                        resolve(text.trim());
                    }
                    else {
                        resolve("");
                    }
                }
            });
        });
    });
}

function mytemplateid(imagedata) {
    return new Promise(function (resolve, reject) {
        templatecrop(imagedata).then(() => {
            templateidrecog().then(templateid => {
                if (templateid.length != 0){
                    var IdObj=new Object();
                    IdObj.templateid="template"+templateid;
                    IdObj.imagedata=imagedata;
                    resolve(IdObj);
                }
                else { reject(err) };
            })
        });
    });
}

module.exports = { mytemplateid: mytemplateid };