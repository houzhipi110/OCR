Promise = require('Bluebird');
var gm = require('gm');
var fs = require("fs");
var getPixels = require("get-pixels");

//main pixels_recog()     return a boolean
function pixels_recog(imagedataPath) {
    return new Promise(function (resolve, reject) {
        Recog_Size(imagedataPath).then((value) => {
            pixels_sum(imagedataPath,value).then((flag) => {
                if (flag == 1) {
                    console.log('Recognized true');
                    resolve(true);
                }
                else if (flag == 0) {
                    console.log('Recognized false')
                    resolve(false);
                } else { reject(err); }
            });
        });
    });
}

function pixels_sum(imagedataPath,value) {
    return new Promise(function (resolve, reject) {
        getPixels(imagedataPath, function (err, pixels) {
            if (err) {
                console.log("Bad image path");
                reject(err);
                return
            }
            var pixelMatrix = new Array();
            for (var i = 0; i < value.width; i++) {
                pixelMatrix[i] = new Array();
                for (var j = 0; j < value.height; j++) {
                    pixelMatrix[i][j] = pixels.get(i, j, 0);//
                }
            }
            var flag = 0;
            var black_num = 0;
            for (var i = 0; i < value.width; i++) {
                for (var j = 0; j < value.height; j++) {
                    if (pixelMatrix[i][j] < 50) {
                        black_num++;
                    }
                }
            }
            if (black_num > 10) {
                flag = 1;
            }
            resolve(flag);
        });
    })
}

function Recog_Size(imagedataPath) {
    return new Promise(function (resolve, reject) {
        gm(imagedataPath)
            .size(function (err, value) {
                if (!err) {
                    console.log('image size recog done');
                    console.log("value.width=" + value.width);
                    resolve(value);
                } else {
                    console.log('image size recog error' + err);
                    reject(err);
                }
            });
    });
}

module.exports = { pixels_recog: pixels_recog };