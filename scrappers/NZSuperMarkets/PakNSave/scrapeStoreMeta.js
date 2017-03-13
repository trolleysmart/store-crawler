
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

var app = express();

var specialRepo = require('../ParseServer/specialRepo');

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

    var store = "PakNSave " + $(".store").children().first().text();

    $(".location").filter(function () {
        var data = $(this);

        data.find("li").each(function (i, elem) {
            var locations = $(this);

            var x = elem.children.  find(".mar-bot-10");
                    console.log(x);


               // locationIds.push({ description: description, price: dollars + "." + cents, unit: unit, endDate: endDate.trim(), comments: limit.trim() });

        });
    });

    // TODO - send this to an API to he stored in our DB.
    //fs.writeFile("output.json", JSON.stringify({storeId: store, specials:scrappedSpecials}), function (err) {
    //    console.log("File successfully written! - Check your project directory for the output.json file");
    //});
    specialRepo.saveSpecialHistory(store, scrappedSpecials);

    console.log("/*----------------------------------------------");
    console.log("               Program Ends");
    console.log("-----------------------------------------------*/");
};


module.exports = {
    run: function (storeId) {

        // Request the promotion page of the PakNSave website
        request({ url: urlPakNSave }, function (req, res, html) {
            serverRequestCallback(html);
        });
    }
}

