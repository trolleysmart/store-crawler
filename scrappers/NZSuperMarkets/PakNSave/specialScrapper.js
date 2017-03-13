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
var parseRepo = require('../ParseServer/parseRepo');

/*----------------------------------------------
                Constant Declaration
-----------------------------------------------*/
var urlPakNSave = "http://www.paknsave.co.nz";
var urlPakNSavePromo = urlPakNSave + "/promotions-and-deals";

/*----------------------------------------------
                Program Logic
-----------------------------------------------*/

var serverRequestCallback = function (storeId, html) {
    var $ = cheerio.load(html);

    var scrappedSpecials = [];

    var store = "PakNSave " + $(".store").children().first().text();

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
            var unit = special.find(".measure").text();  // <span class="measure">ea</span>

            var comment = special.children().last().text().split("."); // <p><small> Ends 12/02/2017.<br />(Limit 4)</small></p>

            var limit = undefined;
            var endDate = comment[0];

            if (comment.length === 2) {
                limit = comment[1];
            }

            scrappedSpecials.push(
                {
                    description: description,
                    price: dollars + "." + cents,
                    unit: unit,
                    endDate: endDate.trim(),
                    comments: limit != undefined ? limit.trim() : ''
                });
        });
    });

    parseRepo.saveSpecialHistory(storeId, scrappedSpecials);
};

module.exports = {
    run: function (storeId) {
        var j = request.jar();
        var cookie = request.cookie("paknsave-store-id=storenodeid=" + storeId);
        j.setCookie(cookie, urlPakNSave);

        // Request the promotion page of the PakNSave website
        request({ url: urlPakNSavePromo, jar: j }, function (req, res, html) {
            serverRequestCallback(storeId, html);
        });
    }
}


