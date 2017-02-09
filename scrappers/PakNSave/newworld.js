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
var urlNewWorld = "http://www.newworld.co.nz";
var urlNewWorldSavings = urlNewWorld + "/savings";

/*----------------------------------------------
                Program Logic
-----------------------------------------------*/
var argv = require('minimist')(process.argv.slice(2));

if (argv.code === undefined) {
    console.log("Please provide a store code as parameter. eg. node main.js code=1084");
    process.exit();
}

var serverRequestCallback = function (html) {
    //var cookie_string = j.getCookieString(urlNewWorld); // "key1=value1; key2=value2; ..."
    //var cookies = j.getCookies(urlNewWorld);
    //console.log(cookies);
    var $ = cheerio.load(html);

    var scrappedSpecials = [];


    $(".savings-promos").filter(function () {
        var data = $(this);

        data.find("li").each(function (i, elem) {
            var special = $(this);

            // get the description of item - eg. Leg of Lamb
            var description = special.find("h4").text();

            // Price
            //<p class="price">2 for  5<span>00</span></p>
            var priceArr = special.find(".price").html().replace("<span>", "###").replace("</span>", "").split("###").toString().replace(",", ".").split("for");
            var priceAndUnit = (priceArr.length == 2 ? priceArr[0] + "for $" + priceArr[1].trim() : "$" + priceArr[0])
                .replace(" ea", "###ea")
                .replace(" kg", "###kg")
                .replace(" pk", "###pk")
                .split("###");

            var price = priceAndUnit[0];

            // Unit of measure
            var unit = priceAndUnit.length > 1 ? priceAndUnit[1] : "";

            // Extra details about the discount
            var details = special.find(".detail").html().split("<br>");

            scrappedSpecials.push(
                {
                    description: description,
                    price: price,
                    unit: unit,
                    endDate: (details.length === 2 ? details[1] : details[0]),
                    comments: (details.length === 1 ? "" : details.toString()),
                });
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

// New World requires to know what store the user is interested on. That is done via session cookies.
/*
new-world-store-id=storenodeid=1277; NewWorldRegionId=1154
*/

var j = request.jar();
var cookie = request.cookie("new-world-store-id=storenodeid=" + argv.code);
j.setCookie(cookie, urlNewWorld);

// Request the promotion page of the New World website
request({ url: urlNewWorldSavings, jar: j }, function (req, res, html) {
    serverRequestCallback(html);
});




exports = module.exports = app;


