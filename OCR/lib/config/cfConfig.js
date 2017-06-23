"use strict";

// This file holds the logic to read relevant config file based on environment app is running in.
var cfenv = require("cfenv");
var config = require('config');

var appEnv = cfenv.getAppEnv();
var localConfig;
var isRunningInCF = false;

module.exports = function () {
    return {
        requireConfig: requireConfig,
        getAppEnv: getAppEnv,
        isEnvCF: isEnvCF
    };
};

(function () {
    if (appEnv.isLocal) {
        localConfig = config;
    } else {
        isRunningInCF = true;
    }
})();

function isEnvCF() {
    return isRunningInCF;
}

function requireConfig(name) {
    var value = readConfig_orDefault(name, "__NOT_FOUND__");
    if (value === "__NOT_FOUND__") {
        throw new Error("missing configuration: " + name);
    }
    return value;
}

function readConfig_orDefault(name, defaultValue) {
    var value = null;
    if (appEnv.isLocal) {
        if (localConfig.has(name)) {
            value = localConfig.get(name);
        }
        if (value === null || value === void (0)) {
            return defaultValue;
        }
        return value;
    } else {
        value = process.env[name];
        if (
            (value === null)
                || (value === void (0))
                || (
                    (typeof (defaultValue) === "string")
                      && (defaultValue.trim() === "")
                )
        ) {
            return defaultValue;
        }
        try {
            return value;//JSON.parse(value);
        } catch (err) {
            throw err;
        }
    }
}

function getAppEnv(key) {
    if (isRunningInCF) {
        return appEnv.app[key];
    } else {
        return;
    }
}