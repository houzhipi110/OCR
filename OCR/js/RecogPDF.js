var fs = require("fs");
var path = require('path');
var gm = require('gm');
var tesseract = require('node-tesseract');
Promise = require('Bluebird');
var gs = require('node-gs');
var _ = require('lodash');
//global.temp_path;
global.templateDir=path.resolve(__dirname, '..') + "/templates/";

function CMMs_list_input(filenamestack){
    var ouououout=[]
    var count=0;
    //var dataa=new Buffer(1000);
    return new Promise.map(filenamestack,filename=>{
        return new Promise(function(resolve,reject){
            CMM(filename).then(out=>{
                count++;
                var dataa=new Buffer(filename+'.pdf '+'importing finished \r\n');
                fs.appendFileSync(templateDir+'RECOG_log.txt',dataa );
                resolve(out);
            });
        })
    })
}

function CMM(name) {
    return new Promise(function (resolve, reject) {
        var pdffilename = name;
        var tempfolderpath = Create_date_folder();
        if (pdffilename.length != 0) {
            handlealltestfiles(pdffilename,tempfolderpath).then(outputs => {
                resolve(outputs);
            });
        }
    });
}


function handlealltestfiles(pdffilename,tempfolderpath) {
    return new Promise((resolve, reject) => {
        if (!fs.exists(pdffilename)) {
            imagepath = path.resolve(__dirname, '..') + "/data/pdf/" + pdffilename + ".PDF";
            var temppath = path.join(tempfolderpath, pdffilename);
            if (!fs.existsSync(temppath)) {
                fs.mkdirSync(temppath);
            }
            imageOperation(imagepath, temppath).then(out => { resolve(out); });
        }
    });
}

function imageOperation(imagepath, tempfolderpath) {
    return new Promise(function (resolve, reject) {
        Pdf2image(imagepath, tempfolderpath).then((imagedataPath) => {
            Append_picture_mode(imagedataPath).then((outputpath) => {
                mytemplateid(outputpath, tempfolderpath).then(templateid => {
                    getTemplate(templateid).then(templatejson => {
                        parsetemplate(templatejson).then(objects => {
                            handelWholeTempalte(objects, outputpath, tempfolderpath, templatejson).then((objcts) => {
                                RecogPDF(objcts).then((objects) => {
                                    outputtxt(objects).then((output) => {
                                        console.log("completed");
                                        console.log(output);
                                        resolve(output);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

function Create_date_folder() {
    var currentdate = new Date();
    var currentdatestring = currentdate.toISOString().replace(/[^0-9]/g, "");
    var tempfolderpath = path.resolve(__dirname, '..') + "/temp/" + currentdatestring;
    //temp_path = tempfolderpath;
    if (!fs.existsSync(tempfolderpath)) {
        fs.mkdirSync(tempfolderpath);
        return tempfolderpath
    }
}

function getTemplate(templateid) {
    return new Promise(function (resolve, reject) {
        var templatepath = path.join(global.templateDir, templateid + ".json");
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

function Pre_segment(outputpath, json) {
    return new Promise.map(json.SimpleTable, target_json => {
        return new Promise(function (resolve, reject) {
            //var num = parseFloat(jsonfile.segmentationNum);
            var cropwidth = parseFloat(target_json.Segwidth);
            var cropheight = parseFloat(target_json.Segheight);
            var cropX = parseFloat(target_json.PointX);
            var cropY = parseFloat(target_json.PointY);
            var tempfilepath = temp_path + '/' + target_json.blockId + '.png';
            gm(outputpath)
                .crop(cropwidth, cropheight, cropX, cropY)
                .write(tempfilepath, function (err) {
                    if (!err) {
                        console.log('image segmentation done ' + tempfilepath);
                        resolve(tempfilepath);
                    } else {
                        console.log(err);
                        console.log('image segmentation error ' + tempfilepath);
                        reject(err);
                    }
                });
        });
    });
}


function RecogPDF(Obj) {
    return new Promise.map(Obj, target_obj => {
        return new Promise(function (resolve, reject) {
            var option = {
                l: 'eng',  //languguaasdasd
                psm: 6,
                //'config': 'digits',
                binary: 'tesseract'
            };
            var tempfilepath = target_obj.tempPathes[0];
            tesseract.process(tempfilepath, option, function (err, text) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(tempfilepath + ' Recognize results:' + text);
                    if (text.trim()) {
                        var outtext = text.trim();
                        target_obj["result"] = outtext;
                        resolve(target_obj);
                    }
                }
            });
        });
    });
}

function image_copy(imagedatapath, imagedataPath) {
    fs.writeFileSync(imagedataPath, fs.readFileSync(imagedatapath));
}
function outputtxt(objcts) {
    return new Promise(function (resolve, reject) {
        var string = JSON.stringify(objcts)
        resolve(string);
    });
}




function Pdf2image(imagedatapath, tempfolderpath) {
    var filename = path.basename(imagedatapath);
    filename = filename.substring(0, filename.length - 4);
    var imagedataPath = path.join(tempfolderpath, filename + '_processed' + '.jpg');
    //   image_copy(imagedatapath, imagedataPath);
    return new Promise(function (resolve, reject) {
        var fileName = imagedatapath;
        //var pathess = tempfolderpath
        imagedataPath = tempfolderpath;
        gs()
            .batch()
            .nopause()
            .option('-r' + 150 * 2)
            .option('-dTextAlphaBits=4')
            .option('-dGraphicsAlphaBits=4')
            .device('png16m')
            .input(fileName)
            .output(imagedataPath + '/test-%d.png')
            // optional: 
            .executablePath('C:/Program Files/gs/gs9.10/bin/gswin64c.exe')
            .exec(function (error, stdout, stderr) {
                if (error) {
                    // ¯\_(ツ)_/¯ 
                    reject(error);
                } else {
                    // ( ͡° ͜ʖ ͡°) 
                    resolve(imagedataPath);
                }
            });
    });
}


function Image2pure(imagedataPath) {
    return new Promise(function (resolve, reject) {
        imagedataPath = imagedataPath + '/test-1.png';
        gm(imagedataPath)
            .threshold(60, 1)
            .write(imagedataPath, function (err) {
                if (!err) {
                    console.log(' Image2pure done ' + imagedataPath);
                    resolve(imagedataPath);
                } else {
                    console.log(err);
                    console.log(' Image2pure error ' + imagedataPath);
                    reject(err);
                }
            });
    });
}

function Get_pdf_page(imagedataPath) {
    var files = fs.readdirSync(imagedataPath);
    var num_page = 0;
    for (var i = 0; i < files.length; i++) {
        files[i] = files[i].substring(files[i].length - 3, files[i].length);
        if (files[i] == 'png') {
            num_page++;
        }
    }
    return num_page;
}



function Append_picture_mode(imagedataPath) {
    var num_page = Get_pdf_page(imagedataPath);
    return new Promise(function (resolve, reject) {
        var tempfilepath = imagedataPath + '/test.png';

        switch (num_page) {
            case 1:
                gm(imagedataPath + '/test-1.png')
                    .threshold(60, 1)
                    .write(tempfilepath, function (err) {
                        if (!err) {
                            console.log('Append_picture_mode done ' + tempfilepath);
                            resolve(tempfilepath);
                        } else {
                            console.log(err);
                            console.log('Append_picture_mode error ' + tempfilepath);
                            reject(err);
                        }
                    });
                break;
            case 2:

                break;
            case 3:
                gm(imagedataPath + '/test-1.png')
                    .append(imagedataPath + '/test-2.png', imagedataPath + '/test-3.png')
                    .threshold(60, 1)
                    .write(tempfilepath, function (err) {
                        if (!err) {
                            console.log('Append_picture_mode done ' + tempfilepath);
                            resolve(tempfilepath);
                        } else {
                            console.log(err);
                            console.log('Append_picture_mode error ' + tempfilepath);
                            reject(err);
                        }
                    });
                break;
            case 4:

                break;
            case 5:

                break;

        }
    });
}

function Append_pictures(pdf_page_num, imagedataPath) {
    var z = [];
    for (var i = 2; i <= pdf_page_num; i++) {
        z.push(i);
    }
    return Promise.map(z, j => {
        return Append_single(imagedataPath, j).then(() => {
            console.log("splitting done");
        });
    });
}

function Append_single(imagedataPath, j) {
    return new Promise(function (resolve, reject) {
        var tempfilepath = imagedataPath + '/test-1.png';
        gm(imagedataPath + '/test-1.png')
            .append(imagedataPath + '/test-' + j + '.png')
            //.threshold(60, 1)
            .write(imagedataPath + '/test-1.png', function (err) {
                if (!err) {
                    console.log('image Append_single done ' + tempfilepath + j + 'times');
                    resolve(imagedataPath);
                } else {
                    console.log(err);
                    console.log('image Append_single error ' + tempfilepath + j + 'times');
                    reject(err);
                }
            });
    });
}

function mytemplateid(outputpath, tempfolderpath) {
    return new Promise(function (resolve, reject) {
        var filename = path.basename(tempfolderpath);
        //filename = filename.substring(filename.length - 5, filename.length - 4);
        //fliename=path.basename(tempfolderpath)

        resolve("template" + filename);




    });
}


function parsetemplate(templatejson) {
    return new Promise(function (resolve, reject) {

        for (var i = 0; i < 3; i++) {
            var objects;
            switch (i) {
                case 0:
                    objects = templatejson.blocks1;
                    break;
                case 1:
                    objects = templatejson.blocks2;
                    break;
                case 2:
                    objects = templatejson.blocks3;
                    break;
            }

            objects.forEach(function (object) {
                if (object.blockId) {
                    object["width"] = (object.bottomRightX - object.topLeftX) / object.cellNum;
                    object["height"] = (object.bottomRightY - object.topLeftY);
                    if (object["width"] <= 0 || object["height"] <= 0) {
                        reject(object.blockId + ' demension error');
                    }
                    object.bottomRightX = parseFloat(object.bottomRightX);
                    object.bottomRightY = parseFloat(object.bottomRightY);
                    object.topLeftX = parseFloat(object.topLeftX);
                    object.topLeftY = parseFloat(object.topLeftY);
                    object.cellNum = parseFloat(object.cellNum);
                }
            });
        }
        resolve(objects)
    });
}



function split(imagedata, templatejson = '') {
    var z = [];
    for (var i = 0; i < 10; i++) {
        z.push(i);
    }
    return Promise.map(z, i => {
        return mysegmentation(imagedata, i).then(() => {
            console.log("splitting done");
        });
    });
}

function handelWholeTempalte(objects, outputpath, tempfolderpath, templatejson) {
    // var imagedata=Obj.processedImgBuff;
    // var templatejson=Obj.templatejson;
    var Obj_list = new Array;
    for (var i = 0; i < templatejson.SimpleTable.length; i++) {
        if (templatejson.SimpleTable[i].blockType == "1") {

            for (var j = 0; j < 6; j++) {
                var newobj = copyObj(templatejson.blocks1[j]);
                newobj.OffsetX = parseFloat(templatejson.SimpleTable[i].PointX);
                newobj.OffsetY = parseFloat(templatejson.SimpleTable[i].PointY);
                newobj.Position = templatejson.SimpleTable[i].blockId;
                Obj_list.push(newobj);
            }
        }
        else if (templatejson.SimpleTable[i].blockType == "2") {
            for (var j = 0; j < 1; j++) {

                var newobj = copyObj(templatejson.blocks2[j]);
                newobj.OffsetX = parseFloat(templatejson.SimpleTable[i].PointX);
                newobj.OffsetY = parseFloat(templatejson.SimpleTable[i].PointY);
                newobj.Position = templatejson.SimpleTable[i].blockId;
                Obj_list.push(newobj);
            }
        }

        else if (templatejson.SimpleTable[i].blockType == "3") {
            for (var j = 0; j < 1; j++) {

                var newobj = copyObj(templatejson.blocks3[j]);
                newobj.OffsetX = parseFloat(templatejson.SimpleTable[i].PointX);
                newobj.OffsetY = parseFloat(templatejson.SimpleTable[i].PointY);
                newobj.Position = templatejson.SimpleTable[i].blockId;
                Obj_list.push(newobj);
            }
        }
    }

    return Promise.map(Obj_list, target => {
        return new Promise(function (resolve, reject) {
            mywholesegmentation(outputpath, tempfolderpath, target).then(pathes => {
                var haha = [];
                haha.push(pathes);
                target["tempPathes"] = haha;
                target["Product_name"]=path.basename(tempfolderpath);
                // target["TableId"]=pathes.substring(pathes.length-6,pathes.length-4);
                //               console.log(cc3++);
                resolve(target);
            });
        });
    })
}

function copyObj(obj) {
    let res = {}
    for (var key in obj) {
        res[key] = obj[key]
    }
    return res
}


function mywholesegmentation(outputpath, tempfolderpath, object) {
    return new Promise(function (resolve, reject) {

        var tag = object.blockId;
        if ("groupId" in object) {
            tag = tag + object.groupId;
        }
        var temp_name = object.Position;
        var tempfilename = tag + '_' + temp_name + '.jpg'
        var tempfilepath = path.join(tempfolderpath, tempfilename);
        //var test = __dirname + '/temp/templateid' + '.png';
        // var denmension = object.width - 4 < object.height - 3 ? object.width - 4 : object.height - 2;
        gm(outputpath)
            .crop(object.width, object.height, object.OffsetX + object.topLeftX, object.OffsetY + object.topLeftY)//i * 80 + 4, 4)//segmentations parameters
            //.crop(object.width*0.9, object.height*0.9, z * object.width + 3 + object.topLeftX, object.topLeftY + 3)
            .border(2, 2)
            .write(tempfilepath, function (err) {
                if (!err) {
                    console.log('image segmentation done ' + tempfilename);
                    resolve(tempfilepath);
                } else {
                    console.log(err);
                    console.log('image segmentation error ' + tempfilename);
                    reject(err);
                }
            });
    });
}



module.exports = {
    CMM: CMM,
    CMMs_list_input: CMMs_list_input
};
