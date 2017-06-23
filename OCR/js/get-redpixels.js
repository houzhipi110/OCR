Promise = require('Bluebird');
var gm = require('gm');
var fs = require("fs");
var getPixels = require("get-pixels");
var zeros = require("zeros");
var savePixels = require("save-pixels");
var imagedataPath='c:/Users/502754585/Desktop/new6192/MFGDigitalOCR/redtestdone.jpg';//test can delete
get_redpixels(imagedataPath).then(value=>{console.log('value= '+value)});//test can delete 
//main pixels_recog()     return a boolean
function get_redpixels(imagedataPath) {
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


            var pixelMatrix = zeros([value.width, value.height]);
            



            var pixelMatrixR = new Array();
            for (var i = 0; i < value.width; i++) {
                pixelMatrixR[i] = new Array();
                for (var j = 0; j < value.height; j++) {
                    pixelMatrixR[i][j] = pixels.get(i, j, 0);//
                }
            }
            var pixelMatrixG = new Array();
            for (var i = 0; i < value.width; i++) {
                pixelMatrixG[i] = new Array();
                for (var j = 0; j < value.height; j++) {
                    pixelMatrixG[i][j] = pixels.get(i, j, 1);//
                }
            }
            var pixelMatrixB = new Array();
            for (var i = 0; i < value.width; i++) {
                pixelMatrixB[i] = new Array();
                for (var j = 0; j < value.height; j++) {
                    pixelMatrixB[i][j] = pixels.get(i, j, 2);//
                }
            }
            var flag = 0;
            var black_num = 0;
            for (var i = 0; i < value.width; i++) {
                for (var j = 0; j < value.height; j++) {
                    if (pixelMatrixR[i][j] >190&&pixelMatrixG[i][j]<200&&pixelMatrixB[i][j]<200) {
                        pixelMatrix.set(i,j,255);
                    }
                }
            }
            savePixels(pixelMatrix, "png").pipe(fs.createWriteStream('c:/Users/502754585/Desktop/houzi.png'));
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

module.exports = { get_redpixels: get_redpixels };