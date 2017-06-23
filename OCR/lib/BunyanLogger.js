"use strict";
 
// --- imports
var bunyan = require('bunyan');
//var cfConfig = require("./predix/cfConfig.js")();
var _ = require('lodash');
 
module.exports = {
    logger: getLogger
};
 
function StdSteam() { }
StdSteam.prototype.write = function (rec) {
    _.forEach(['err', 'req', 'res'], key => {
        if (rec[key]) {
            rec.msg = rec.msg + ' ' + key + ':' + JSON.stringify(rec[key]);
            rec[key] = undefined;
        }
    })
    rec.msg = rec.msg.replace('\n', '');
    process.stdout.write(JSON.stringify(rec) + '\n');
    //process.stdout.write('[' + bunyan.nameFromLevel[rec.level] + '] ' + rec.msg.replace('\n', '') + ' (' + rec.src.file + ' ' + rec.src.line + ')\n');
}
 
function getLogger(facility) {
    var streams = [{
        stream: new StdSteam(),
        type: 'raw'
    }];
 
    return bunyan.createLogger({
        name: 'MFG',//cfConfig.getAppEnv('application_name') || 'aviation-myflight-microservice-app-local',
        src: true,
        level: 'TRACE',
        streams: streams,
        serializers: {
            err: err,
            res: res,
            req: req
        }
    });
}
 
function err(err) {
    return {
        message: err.message,
        stack: err.stack
    }
}
 
function req(request) {
    return {
        url: request.url,
        method: request.method,
        body: request.body
    }
}
 
function res(response) {
    var url;
    var method;
    if (response.request) {
        if (response.request.uri) {
            url = response.request.uri.href;
        }
        method = response.request.method;
    }
    return {
        url: url,
        method: method,
        statusCode: response.statusCode,
        body: response.body,
        header: response.header
    }
}
 