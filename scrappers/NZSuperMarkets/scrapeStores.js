var assert = require("assert");     // <-- For asserting assumptions
require('./ParseServer/configure');
var pakNSaveScrapper = require('./PakNSave/scrape');
var pakNSaveMetadataScrapper = require('./PakNSave/scrapeStoreMeta');

/*
var argv = require('minimist')(process.argv.slice(2));
if (argv.code === undefined) {
    console.log("Please provide a store code as parameter. eg. node pakNScrape.js --code=1084");
    process.exit();
}
*/

pakNSaveMetadataScrapper.run();

