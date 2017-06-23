Promise = require('Bluebird');
var gm = require('gm');
var fs = require("fs");
var getPixels = require("get-pixels");
var zeros = require("zeros");
var savePixels = require("save-pixels");
var imagedataPath='c:/Users/502754585/Desktop/new6192/MFGDigitalOCR/houzipi.jpg';
num_recog_munual(imagedataPath).then(value=>{console.log('value= '+value)});
//main num_recog_munual()     return a boolean
function num_recog_munual(imagedataPath) {
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


            var record = new Array();
            for (var i = 0; i < value.height; i++) {
                record[i] = new Array();
                for (var j = 0; j < 2; j++) {
                    record[i][j] = 0;//
                }
            }



            var pixelMatrix = new Array();
            for (var i = 0; i < value.width; i++) {
                pixelMatrix[i] = new Array();
                for (var j = 0; j < value.height; j++) {
                    pixelMatrix[i][j] = pixels.get(i, j, 0);//
                }
            }


            var first_flag=0;
            var first_row=0;
            var flag = 0;
            //var black_num = 0;
            for (var j = 0; j < value.height; j++) {
                for (var i = 0; i < value.width; i++) {
                    var black_num = 0;
                    if (pixelMatrix[i][j] <100&&(pixelMatrix[i+1][j]+pixelMatrix[i+2][j]<255) ){
                        if(first_flag==0){
                            first_flag=1;
                            first_row=j;
                        }
                        record[j][0]=i;//position
                        
                        for(var x=i;x<value.width;x++){
                            if(pixelMatrix[x][j]<100){
                                black_num++;
                            }

                        }
                        record[j][1]=black_num;

                    break    
                    }
                }
            }
            
            var dis_num=0;
            for (var i = first_row; i < value.height-1; i++) {
                if( !( (record[i+1][0]-record[i][0])<3 &&( ((record[i+1][1]-record[i][1])<=3 && (record[i+1][1]-record[i][1])>=0)||( (record[i][1]-record[i+1][1])<=3 && (record[i][1]-record[i+1][1])>=0) ) ))
                   dis_num++;//
                
            }
            if ( dis_num<= 2) {
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

module.exports = { num_recog_munual: num_recog_munual };