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

/*----------------------------------------------
                Constant Declaration
-----------------------------------------------*/
var urlPakNSave = "http://www.paknsave.co.nz";
var urlPakNSavePromo = urlPakNSave + "/promotions-and-deals";

/*----------------------------------------------
                Program Logic
-----------------------------------------------*/
var argv = require('minimist')(process.argv.slice(2));

if (argv.code === undefined) {
    console.log("Please provide a store code as parameter. eg. node main.js code=1084");
    process.exit();
}

var serverRequestCallback = function (html) {
    //var cookie_string = j.getCookieString(urlPakNSave); // "key1=value1; key2=value2; ..."
    //var cookies = j.getCookies(urlPakNSave);
    //console.log(cookies);
    var $ = cheerio.load(html);

    var scrappedSpecials = [];


    $(".list-prod").filter(function () {
        var data = $(this);

        data.find("li").each(function (i, elem) {
            var special = $(this);

            // get the description of item - eg. Leg of Lamb
            var description = special.find("h2").text();

            // Price
            //<p class="cost"><abbr class="ir dollars" title="New Zealand Dollar">$</abbr><span class="dollars">7</span><sup class="cents">99</sup>
            var dollars = special.find(".dollars").text();
            var cents = special.find(".cents").text();

            // Unit of measure
            var measure = special.find(".measure").text();  // <span class="measure">ea</span>

            var comment = special.children().last().text().split("."); // <p><small> Ends 12/02/2017.<br />(Limit 4)</small></p>
            assert(comment.length > 0 && comment.length <= 2);

            var limit = undefined;
            var endDate = comment[0];

            if (comment.length === 2) {
                limit = comment[1];
            }

            scrappedSpecials.push({ description: description, price: dollars + "." + cents, measure: measure, endDate: endDate.trim(), limit: limit.trim() });

            /*
            $(this).children().each(function (n, e2) {
                var special = $(this);

                description = special.
                console.log("HTML Content: " + $(this).html());
            });
            */
        });
    });

    // TODO - send this to an API to he stored in our DB.
    fs.writeFile("output.json", JSON.stringify(scrappedSpecials), function (err) {
        console.log("File successfully written! - Check your project directory for the output.json file");
    });

    console.log("/*----------------------------------------------");
    console.log("               Program Ends");
    console.log("-----------------------------------------------*/");
};

// PakNSave requires to know what store the user is interested on. That is done via session cookies.
/*
PakNSave Store Codes:
Hornby      = 1206
Albany      = 1084
Riccarton   = 1209
*/

var j = request.jar();
var cookie = request.cookie("paknsave-store-id=storenodeid=" + argv.code);
j.setCookie(cookie, urlPakNSave);

// Request the promotion page of the PakNSave website
request({ url: urlPakNSavePromo, jar: j }, function (req, res, html) {
    serverRequestCallback(html);
});




exports = module.exports = app;


