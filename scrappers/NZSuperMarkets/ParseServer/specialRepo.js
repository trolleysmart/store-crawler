module.exports = {
    getSpecials: function () {
        var Special = Parse.Object.extend("SpecialHistory");

        var query = new Parse.Query(Special);
        query.find({
            success(results) {
                results.map(item => {
                    console.log(item);
                });
            },
            error(message) {
                console.log(error);
            }
        });
    },

    saveSpecialHistory: function (storeId, specials) {
        var specialHistory = Parse.Object.extend("SpecialHistory");
        var newSpecial = new specialHistory();
        newSpecial.set("storeId", storeId);
        newSpecial.set("specials", specials);
        newSpecial.save(null, {
            success: function(obj) {
                console.log(obj);
            },
            error: function(obj, error) {
                console.log(err);
            }
        });
    }
}


