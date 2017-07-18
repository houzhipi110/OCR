var xlsx = require('node-xlsx').default;
var fs = require('fs');
var path = require('path');
var util = require("../lib/util.js")();

//var json_path =__dirname+'../templates/response001.json';
//var json_path = path.join('./templates/response001.json');
//var json = JSON.parse(fs.readFileSync(json_path, 'utf8'));
//filldata2excel(1,2);
function json2excel(json) {
    return new Promise(function (resolve, reject) {
        //var json = JSON.parse(jsonstring);
        var object = json.blocks[0];

        var blocks_num = json.blocks.length;

        var data_matrix = new Array();
        for (var i = 0; i < blocks_num + 1; i++) {
            data_matrix[i] = new Array();
        }

        var count = 0;
        for (var key in object) {
            data_matrix[0][count++] = key;
        }

        for (var i = 1; i < blocks_num + 1; i++) {
            count = 0;
            var objecteach = json.blocks[i - 1]
            for (var key in objecteach) {
                data_matrix[i][count++] = objecteach[key];
            }
        }

        const data = data_matrix;
        var mySheetName = 'Sheet' + json.templateId;
        //const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
        var buffer = xlsx.build([{ name: mySheetName, data: data }]); // Returns a buffer 
        //console.log('buffer' + buffer);

        var excel_output_path = 'test.xlsx';
        var tempfilepath = __dirname + '/temp/response' + json.templateId + '.xlsx';
        fs.writeFile(excel_output_path, buffer, function (err) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve(excel_output_path);
            }
        });
    });
}

function filldata2excel(characterresult, partresult) {
    return new Promise(function (resolve, reject) {
        var xlsxPath = './templates/eCAV_J1290P16.xls';
        var data_table_index = 3;// list_index 
        var write_position_row;
        var write_position_col = 19;//
        var dir = util.createFolder("./export");
        var excel_output_path = dir + '/export-' + (new Date()).toISOString().replace(/[^0-9]/g, "") + '.xlsx';
        // fs.createReadStream(xlsxPath).pipe(fs.createWriteStream(excel_output_path));
        var workSheetsFromBuffer = xlsx.parse(fs.readFileSync(xlsxPath));

        var Array_out = new Array();
        for (var i = 0; i < characterresult.data.length; i++) {
            Array_out[i] = new Array();
        }

        for (var i = 0; i < characterresult.data.length; i++) {
            var Array_counts = 0;
            for (var key in characterresult.data[i]) {

                switch (key) {
                    case 'cn':
                        Array_out[i][Array_counts++] = characterresult.data[i][key];
                        break

                    case 'actualminvalue':
                        Array_out[i][Array_counts++] = characterresult.data[i][key];
                        break

                    case 'sn':
                        Array_out[i][Array_counts++] = characterresult.data[i][key];
                        break

                }
                /*if (key == 'cn') {
                    var element = characterresult.data[i][key];
                    Array_out[Array_counts++][0] = element;
                }*/
            }
        }
        // var Ddata = fs.readFileSync('C:\\Users\\502754585\\Desktop\\as.json', 'utf-8');
        //var haha = JSON.parse(Ddata);
        //var character_pn=haha.operation[0].characters[i].cn;
        for (var i = 0; i < partresult.data[0].data.operation[0].characters.length; i++) {
            var character_pn = partresult.data[0].data.operation[0].characters[i];
            for (var key in character_pn) {
                if (key == 'cn') {
                    for (var k = 0; k < Array_out.length; k++) {
                        if (character_pn[key] == Array_out[k][1]) {
                            for (var key in character_pn) {
                                switch (key) {
                                    case 'desc':
                                        Array_out[k].push(character_pn[key]);
                                        break

                                    case 'sheetZone':
                                        Array_out[k].push(character_pn[key]);
                                        break

                                }
                            }
                        }
                    }

                }
            }

        }


        var search_matrix = ['Serial No.', 'CN', 'Results', 'Drawing Requirements\nSpec Requirements', 'Sheet Zone'];

        var CN_row = search_row(workSheetsFromBuffer, data_table_index);
        var setup_col = [];
        for (var j = 0; j < search_matrix.length; j++) {
            setup_col.push(search_col(workSheetsFromBuffer, data_table_index, search_matrix[j], CN_row));
        }

        //var setup_col = [21,0,19, 2, 9];  //sn ，cn，result，desc，sheetZone
        for (var i = 6; i < 6 + Array_out.length; i++) {
            for (var j = 0; j < Array_out[0].length; j++) {
                workSheetsFromBuffer[data_table_index].data[i][setup_col[j]] = Array_out[i - 6][j];
            }
        }
        var partnum_position = [1, 0];
        var part_content = "Part Number: " + partresult.data[0].data.pn;
        workSheetsFromBuffer[data_table_index].data[1][0] = part_content;

        /*   var CN_num = json.data[0].cn;
           write_position_row = search_CN(workSheetsFromBuffer, data_table_index, CN_num);
           workSheetsFromBuffer[data_table_index].data[write_position_row][write_position_col] = 'data write test succeed';//
           var data = workSheetsFromBuffer;
           //var mySheetName = 'New_eCAV';
           //const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
           var buffer = xlsx.build(data); // Returns a buffer 
           //console.log('buffer' + buffer);
           */
        var data = workSheetsFromBuffer;
        var buffer = xlsx.build(data);
        fs.writeFile(excel_output_path, buffer, function (err) {
            if (err) { console.log(err); reject(err); }
            else { console.log('done'); resolve(excel_output_path); }
        });
    });
}

function search_row(workSheetsFromBuffer, data_table_index) {
    for (var i = 0; i < workSheetsFromBuffer[data_table_index].data.length; i++) {
        if (workSheetsFromBuffer[data_table_index].data[i][0] == 'CN') {
            return i;
        }
    }
}


function search_col(workSheetsFromBuffer, data_table_index, keyword, CN_row) {
    for (var i = 0; i < workSheetsFromBuffer[data_table_index].data[CN_row].length; i++) {
        if (workSheetsFromBuffer[data_table_index].data[CN_row][i] == keyword) {
            return i;
        }
    }
}

module.exports = {
    json2excel: json2excel,
    filldata2excel: filldata2excel
};

