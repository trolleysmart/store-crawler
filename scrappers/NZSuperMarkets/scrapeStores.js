require('./ParseServer/configure');
var pakNSaveSpecialScrapper = require('./PakNSave/specialScrapper');
var pakNSaveMetadataScrapper = require('./PakNSave/scrapeStoreMeta');


pakNSaveMetadataScrapper.run().then(function(result) {
    result.forEach(function(item) {
        pakNSaveSpecialScrapper.run(item.storeId);
    })
});



