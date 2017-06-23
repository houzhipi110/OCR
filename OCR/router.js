'use strict';

var express = require('express');

module.exports = function (logger) {
    var service = require('./js/service')(logger),
        router = express.Router();
    router.get('/template/:templateId/', service.getTemplate);
    router.post('/ocr', service.ocr);
    router.post('/ocrtest', service.ocrtest);
    router.service = service;
    return router;
};