var fs = require("fs");
var mypreprocessing = require("../js/pre-process");
var mysegmentation = require("../js/segmentation");
var myrecognition = require("../js/recognition");
var myoutput = require("../js/outputEquip");
var templateid = require("../js/templateid");
var base64convertor = require("../lib/base64Convertor");
var service = require('../js/service');
var path = require('path');



// var covertbase64 = base64convertor.base64_fix('./tests/template001.jpg');
// fs.writeFile("covertbase64temp", 'utf8', function (err, data) {
//     if (err) {
//          console.log("failed");
//     }
//     else {
//         console.log("succeed");
//     }

// });

function getTemplate(Obj) {
    return new Promise(function (resolve, reject) {
        var templatepath = path.resolve(__dirname, '..') + "/templates/" + Obj.templateid + ".json";
        fs.readFile(templatepath, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                var templatejson = JSON.parse(data);
                var mix_obj =new Object();
                mix_obj.templatejson=templatejson;
                mix_obj.processedImgBuff=Obj.imagedata;
                resolve(mix_obj);
            }
        });
    });
}

var imagepath = "image (1)";
//console.log(templateid);
if (imagepath) {
    if (!fs.exists(imagepath)) {
        imagepath = path.resolve(__dirname, '..') + "/templates/" + imagepath + ".jpg";
    }
}
fs.exists(imagepath, (exists) => {
    if (exists) {
        mypreprocessing.pre_total(imagepath).then((outputpath) => {
            //executeOCRPost(outputpath);
            fs.readFile(outputpath, 'base64', function (err, imagedata) {
                executeOCRPost(imagedata);
            });
        });
    }
});

function executeOCRPost(imagedata) {
    templateid.mytemplateid(imagedata).then((IdObj) => {
        getTemplate(IdObj).then((mix_obj) => {
            mysegmentation.mywholetempaltesplit(mix_obj).then((objcts) => {
                myrecognition.mywholerecognition(objcts).then((outputs) => {
                    myoutput.myoutput(outputs).then((output) => {
                        console.log("completed");
                        //var outputjson = JSON.stringify(output);
                        console.log(output);
                    });
                });
            });
        });
    }, err => {
        //res.status(500).json({ err: err.message })
    });
}

// var testimagebase64 = base64convertor.base64_fix('./templates/template001.jpg');
// mypreprocessing.mypreprocessing(testimagebase64).then((processedImgBuff) => {
//     mysegmentation.mysegmentation(processedImgBuff, 10).then(() => {
//         myrecognition.myrecognition().then((values) => {
//             var result = values.join("");
//         });
//     });
// });
