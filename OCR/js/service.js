'use strict';
var cfConfig = require("../lib/config/cfConfig.js")();
var request = require('sync-request');
var fs = require('fs');
//var haha=__dirname;
var export2excel = require("./export2excel");
var RecogPDF = require("./RecogPDF");

var _ = require('lodash');

module.exports = function (logger) {
    var pg = require('../lib/pgSql/pgsql')(logger),
        db = require("../lib/pgSql/db.js")(logger),

        HttpUtil = require("../lib/http/httpUtil.js")(logger),
        base64 = require("../lib/base64.js")(),
        util = require("../lib/util.js")();
    var fileData;

    function sendResponse(data, res) {
        logger.info(data);
        if (data.status !== "success") {
            return res.status(400)
                .json({ "error": data.error });
        }
        return res.status(200)
            .json(data.data);
    }

    function save(data, res) {
        var statement = _.reduce(data, function (sql, o, index) {
            if (typeof (o) != "object") {
                o = JSON.parse(o)
            }
            var pass = false;
            if ((o.type == 'range' &&
                (Number(o.actualminvalue) >= Number(o.minvalue) && Number(o.actualmaxvalue) <= Number(o.maxvalue))
                || !o.minvalue || !o.maxvalue)
                || (o.type == 'single' && Number(o.actualvalue) >= Number(o.minvalue) && Number(o.actualvalue) <= Number(o.maxvalue))
            ) {
                pass = true;
            }

            sql.array.push(o.sn)
            sql.array.push(o.userid)
            sql.array.push(o.pn)
            sql.array.push(o.opnum)
            sql.array.push(o.cn)
            sql.array.push(o.description)
            sql.array.push(o.sheetzone)
            sql.array.push(o.type)
            sql.array.push(o.minvalue ? Number(o.minvalue) : null)
            sql.array.push(o.maxvalue ? Number(o.maxvalue) : null)
            sql.array.push(o.type == 'range' ? Number(o.actualminvalue) :
                (o.type == 'single' ? Number(o.actualminvalue ? o.actualminvalue : o.actualvalue) : o.actualvalue))
            sql.array.push(o.type == 'range' ? Number(o.actualmaxvalue) :
                (o.type == 'single' ? Number(o.actualminvalue ? o.actualminvalue : o.actualvalue) : o.actualvalue))
            sql.array.push(pass)
            sql.array.push(o.datetime)
            sql.array.push(o.mode)

            sql.string += 'insert into character(sn \
                  , userid \
                  , pn \
                  , opNum \
                  , cn \
                  , description \
                  , sheetZone \
                  , type \
                  , minValue \
                  , maxValue \
                  , actualMinValue \
                  , actualMaxValue \
                  , pass \
                  , datetime \
                  , mode \
                  , source ) values($'+ Number(index * 15 + 1) + ' \
                    , $'+ Number(index * 15 + 2) + ' \
                    , $'+ Number(index * 15 + 3) + ' \
                    , $'+ Number(index * 15 + 4) + ' \
                    , $'+ Number(index * 15 + 5) + ' \
                    , $'+ Number(index * 15 + 6) + ' \
                    , $'+ Number(index * 15 + 7) + ' \
                    , $'+ Number(index * 15 + 8) + ' \
                    , $'+ Number(index * 15 + 9) + ' \
                    , $'+ Number(index * 15 + 10) + ' \
                    , $'+ Number(index * 15 + 11) + ' \
                    , $'+ Number(index * 15 + 12) + ' \
                    , $'+ Number(index * 15 + 13) + ' \
                    , $'+ Number(index * 15 + 14) + ' \
                    , $'+ Number(index * 15 + 15) + ', \'pad\' );';
            return sql
        }, { string: '', array: [] });

        //console.log(statement)
        return db.none(statement.string, statement.array)
            .then(data => {
                return res.status(200)
                    .json({
                        status: 'success',
                        data: { data: 'insert success for sn' }
                    });
            })
    }

    return {
        getParts: function (req, res) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (req.url.split("?field=").length > 1) {
                return pg.query(db, "any", 'select pn as part from part')
                    .then(function (data) {
                        var pnlist = _.map(data.data, function (o) {
                            return o.part.pn;
                        });
                        data.data = pnlist;
                        sendResponse(data, res);
                    });
            } else {
                return pg.query(db, "any", 'select pn as part from part')
                    .then(function (data) {
                        sendResponse(data, res);
                    });
            }
        },
        getPart: function (req, res) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            return pg.query(db, "one"
                , 'select * from part where (pn::json->>\'pn\') = $1'
                , req.params.partId)
                .then(function (data) {
                    sendResponse(data, res);
                });
        },
        getResult: function (req, res) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            console.log(req.params)
            if (req.url.split("?field=").length > 1) {
                return pg.query(db, "any", 'select distinct sn from character')
                    .then(function (data) {
                        sendResponse(data, res);
                    });
            } else {
                var sql = "select * from character where pn = $1 "
                var array = [req.params.partId]
                if (req.params.opId) {
                    sql += 'and opnum = $2 and cn = $3'
                    array.push(req.params.opId)
                    array.push(req.params.cnId)

                    if (req.params.sn != "0") {
                        sql += ' and sn in (';
                        var paraArray = req.params.sn.split(",");
                        _.forEach(paraArray, function (value, index) {
                            sql += '$' + Number(3 + index + 1) + " ,";
                            array.push(value)
                        });
                        sql = sql.substr(0, sql.length - 1)
                        sql += ')'
                    }
                }
                else {
                    if (req.params.sn != "0") {
                        sql += ' and sn in (';
                        var paraArray = req.params.sn.split(",");
                        _.forEach(paraArray, function (value, index) {
                            sql += '$' + Number(1 + index + 1) + " ,";
                            array.push(value)
                        });
                        sql = sql.substr(0, sql.length - 1)
                        sql += ')'
                    }
                }
                return pg.query(db, "any", sql, array)
                    .then(function (data) {
                        sendResponse(data, res);
                    });
            }
        },
        saveResults: function (req, res) {
            console.log(req.body)
            save(req.body, res)
        },
        savePart: function (req, res) {
            return pg.query(db, "none"
                , 'insert into part(PN) values($1)'
                , [req.body])
                .then(function (data) {
                    sendResponse(data, res);
                });
        },
        download: function (req, res) {
            res.setHeader('Access-Control-Allow-Origin', '*');

           return pg.query(db, "any", 'select * from character')
                .then(function (data) {
                    var dir = util.createFolder("./export");
                    var name = dir + '/sn-' + util.dateFormat(new Date()) + '.json';
                    var out_data=JSON.stringify(data);
                    fs.writeFileSync(__dirname+'/sn-2017-7-6 172353.json', out_data);
                    fs.writeFile(name, out_data, function (err) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ "error": err });
                            
                        } else {
                            console.log('download done')
                            res.download(name);
                        }
                    });
                });
        },
        upload: function (req, res) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (!req.files) {
                return res.status(400).send('No files were uploaded.');
            }

            console.log(req.files[0].name);
            fileData = JSON.parse(req.files[0].data.toString());

            var dir = util.createFolder("./import");
            var name = dir + '/sn-' + util.dateFormat(new Date()) + '.json';
            req.files[0].mv(name, function (err) {
                if (err) {
                    console.log("move failed")
                    res.status(500).json({ "error": err });
                } else {
                    //console.log(data)
                    return save(fileData.data, res)
                }
            })
        },
        excel: function (req, res) {
            console.log(req.params);
            var charactersql = "select * from character where pn = $1 ";
            var characterarray = [req.params.partId];
            if (req.params.snId) {
                charactersql += 'and sn = $2';
                characterarray.push(req.params.snId);
            }


            var partsql ="select * from (select id,pn as data from part) as derivedTable where data->>'pn'= $1 ";
            //var partsql = "select * from part where pn = $1 ";json_array_elements(pn) (select pn as data from part) 
            var partarray = [req.params.partId];
            return pg.query(db, "any", charactersql, characterarray)
                .then(function (characterdata) {
                                //console.log(req.params);
                    return pg.query(db, "any", partsql, partarray)
                    .then(function (partdata) {
                            export2excel.filldata2excel(characterdata,partdata ).then(path => {
                                if (fs.existsSync(path)) {
                                    res.download(path);
                                }
                                else {
                                    res.status(500).json({ "error": path });
                                }
                            });
                        });
                });
        },
        getCMM: function (req, res) {

            //res.send('nice@');
           // console.log(req.params.pdfname);
           // RecogPDF.CMM(req.params.pdfname).then(out=>{ res.end(out)});
         res.send('CMM importing start...')
         var files=fs.readdirSync('./data/pdf');
            console.log(req.params.pdfname);
            for(var i=0;i<files.length;i++){
                files[i]=files[i].substring(0,files[i].length-4);
            }
            //RecogPDF.CMM(req.params.pdfname).then(out=>{ res.end(out)});
            RecogPDF.CMMs_list_input(files).then(out=>{ 
                var b = out.join("-");
                console.log('all is finished')
                //res.send('all is finished');
            });

        }
    };
};
