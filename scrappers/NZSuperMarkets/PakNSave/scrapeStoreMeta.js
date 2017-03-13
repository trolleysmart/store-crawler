
// PakNSave requires to know what store the user is interested on. That is done via session cookies.
/*
PakNSave Store Codes:
Hornby      = 1206
Albany      = 1084
Riccarton   = 1209
*/

"use strict";

/*----------------------------------------------
                Require Section
-----------------------------------------------*/
var express = require("express");
var request = require("request");
var fs = require("fs");
var cheerio = require("cheerio");   // <-- Fast, flexible, and lean implementation of core jQuery designed specifically for the server.
var assert = require("assert");     // <-- For asserting assumptions
var parseRepo = require('../ParseServer/parseRepo');
var app = express();

/*----------------------------------------------
                Constant Declaration
-----------------------------------------------*/
var urlPakNSave = "http://www.paknsave.co.nz";

/*----------------------------------------------
                Program Logic
-----------------------------------------------*/

var serverRequestCallback = function (html) {
    var $ = cheerio.load(html);
    var locationIds = [];
    $(".mar-bot-10 li").each(function (i, elem) {
        elem.children.forEach(function (elem) {
            if (elem.attribs !== undefined && elem.attribs.href !== undefined) {
                var storeInfo = elem.attribs.href.split('=')[1].split('-');

                locationIds.push({ name: storeInfo[0], storeId: storeInfo[1] });
            }
        })
    });

    parseRepo.saveStores(locationIds);
    return locationIds;
};

module.exports = {
    run: function (storeId) {
        return new Promise((resolve, reject) => {
            // Request the promotion page of the PakNSave website
            request({ url: urlPakNSave }, function (req, res, html) {
                resolve(serverRequestCallback(html));
            });
        });
    }
}

