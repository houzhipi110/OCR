'use strict';
var cfConfig = require("../lib/config/cfConfig.js")();
var fs = require("fs");
var mypreprocessing = require("./pre-operation");
var mysegmentation = require("./segmentation");
var myrecognition = require("./recognition");
var base64convertor = require("../lib/base64Convertor");
var myoutput = require("./outputEquip");
var templateid = require("../js/templateid");
var path = require('path');

var _ = require('lodash');
var fs = require('fs');

module.exports = function (logger) {

    function getTemplate(templateid) {
        return new Promise(function (resolve, reject) {
            var templatepath = path.resolve(__dirname, '..') + "/templates/" + templateid + ".json";
            console.log(templatepath);
            fs.readFile(templatepath, 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    var templatejson = JSON.parse(data);
                    resolve(templatejson);
                }
            });
        });
    }

    function executeOCRPost(imagedata, res) {
        templateid.mytemplateid(imagedata).then(templateid => {
            getTemplate(templateid).then(templatejson => {
                mypreprocessing.mypreprocessing(imagedata).then((processedImgBuff) => {
                    mysegmentation.mywholetempaltesplit(processedImgBuff, templatejson).then((objcts) => {
                        myrecognition.mywholerecognition(objcts).then((objects) => {
                            myoutput.myoutput(objcts).then((output) => {
                                console.log("completed");
                                //var outputjson = JSON.stringify(output);
                                console.log(output);
                                res.end(output);
                            });
                        });
                    });
                });
            });
        }, err => {
            res.status(500).json({ err: err.message })
        });
    }

    return {
        ocr: function (req, res) {
            var imagedata = req.body.imagebase64;
            var imagepath = req.body.imagepath;
            //console.log(templateid);
            if (imagepath) {
                if (!fs.exists(imagepath)) {
                    imagepath = path.resolve(__dirname, '..') + "/templates/" + imagepath + ".jpg";
                }
            }
            fs.exists(imagepath, (exists) => {
                if (exists) {
                    fs.readFile(imagepath, 'base64', function (err, imagedata) {
                        if (err) {
                            console.log("read data error");
                        }
                        else {
                            executeOCRPost(imagedata, res);
                        }
                    });
                }
            });
        },

        ocrtest: function (req, res) {
            var imagedata = req.body.imagebase64;
            console.log(imagedata);
            mypreprocessing.mypreprocessing(imagedata).then((processedImgBuff) => {
                mysegmentation.mysegmentation(processedImgBuff, 10).then(() => {
                    myrecognition.myrecognition().then((values) => {
                        var result = values.join("");
                        console.log(result);
                        res.end(result);
                    });
                });
            }, err => {
                res.status(500).json({ err: err.message })
            });
        },

        getTemplate: function (req, res) {
            var templateid = req.params.templateid;
            fs.readFile(__dirname + "/" + templateid, 'utf8', function (err, data) {
                console.log(data);
                res.end(data);
            });
        }
    }
};