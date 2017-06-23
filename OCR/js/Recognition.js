var tesseract = require('node-tesseract');
Promise = require('Bluebird');
var logger = require('../lib/bunyanLogger');
var fs = require("fs");
var tesseract = require('node-tesseract');

//set options
var numoptions = {
    l: 'eng',  //languguaasdasd
    psm: 10,
    'config': 'digits',
    binary: 'tesseract'
};

//set options
var engoptions = {
    l: 'eng',  //languguaasdasd
    psm: 10,
    'config': 'null',
    binary: 'tesseract'
};

function mywholerecognition(objects) {
    return new Promise.map(objects, element => {
        return new Promise(function (resolve, reject) {
            if (element.tempPathes.length != 1) {
                return new Promise.map(element.tempPathes, path => {
                    return processSingleImageBlock(path, element.dataType);
                }).then(values => {
                    var result = values.join("");
                    element["result"] = result.trim();
                    resolve(element);
                });
            }
            else if (element.tempPathes.length == 1) {
                var path = element.tempPathes[0];
                return processSingleImageBlock(path, element.dataType).then(text => {
                    var result = text.replace(/ /g, '').replace('’', '').replace('.', '');
                    element["result"] = result;
                    resolve(element);
                });
            }
        });
    });
}

function myrecognition() {
    // Recognize text of eng in digits
    var z = [];
    for (var i = 0; i < 10; i++) {
        z.push(i);
    }
    return Promise.map(z, i => {
        return processImage(i);
    });
}

function processSingleImageBlock(tempfilepath, type) {
    var values = [];
    return new Promise(function (resolve, reject) {
        fs.exists(tempfilepath, function (exists) {
            console.log(tempfilepath + "exist");
            var option = type == "numeric" ? numoptions : engoptions;
            tesseract.process(tempfilepath, option, function (err, text) {
                if (err) {
                    console.error(err);
                    //values.push(".");
                    reject();
                } else {
                    console.log(tempfilepath + ' Recognize results:' + text);
                    if (text.trim()) {
                        var outtext = text.trim();
                        resolve(outtext);
                    }
                    else {
                        resolve(" ");
                    }
                }
            });
        });
    });
}

function processImage(i) {
    var values = [];
    var tempfilepath = __dirname + '/temp/temp' + i + '.png';
    console.log(tempfilepath);
    return new Promise(function (resolve, reject) {
        fs.exists(tempfilepath, function (exists) {
            tesseract.process(tempfilepath, numoptions, function (err, text) {
                if (err) {
                    console.error(err);
                    values.push(".");
                } else {
                    console.log('Recognize results:' + text);
                    if (text.trim()) {
                        resolve(text.trim());
                    }
                    else {
                        resolve(".");
                    }
                }
            });
        });
    });
}

module.exports = {
    myrecognition: myrecognition,
    mywholerecognition: mywholerecognition
};