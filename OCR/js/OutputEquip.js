var logger = require('../lib/bunyanLogger');
var fs = require("fs");

function generateOutput(objects) {
    return new Promise(function (resolve, reject) {
        var outputString = "";
        objects.forEach(function (object) {
            var target = [];
            if ("groupId" in object) {
                target.push({ groupId: object.groupId });
            }
            var blockidtext = object.blockId;
            target.push({ blockId: blockidtext });
            // if (blockidtext == "reportid" || blockidtext == "sn" ||
            //     blockidtext == "pn" || blockidtext == "operatorid" || blockidtext == "date") {
            // }
            // else {
            //     var attr = [];
            //     attr.push({ blocktopleft: object.topLeftX + "," + object.topLeftY });
            //     attr.push({ blockbotomright: object.bottomRightX + "," + object.bottomRightY });
            //     attr.push({ cellnum: object.cellNum });
            //     target.push({ templateAtt: attr });
            // }
            if (object.result != "") {
                var finalvalue = object.result;
                if (finalvalue.startsWith('.')) {
                    finalvalue = finalvalue.substring(1, finalvalue.length).trim();
                }
                target.push({ blockValue: finalvalue });
                target.push({ status: "succeed" });
            }
            else {
                target.push({ blockValue: "" });
                target.push({ status: "failed" });
            }
            outputString += JSON.stringify(target);
        }, this);
        resolve(outputString);
    });
}


module.exports = { myoutput: generateOutput };