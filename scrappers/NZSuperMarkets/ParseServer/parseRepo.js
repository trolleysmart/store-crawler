var Parse = require('parse/node')

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
            error(error) {
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
            success: function (obj) {
                console.log(obj);
            },
            error: function (obj, error) {
                console.log(err);
            }
        });
    },

    saveStores: function (stores) {
        var store = Parse.Object.extend("Store");

        stores.forEach(function (storeInfo) {
            var query = new Parse.Query(store);
            query.equalTo('storeId', storeInfo.storeId);
            query.count({
                success(count) {
                    if (count === 0) {
                        var newStore = new store();
                        newStore.set("name", storeInfo.name);
                        newStore.set("storeId", storeInfo.storeId);
                        newStore.save(null, {
                            success: function (obj) {
                                console.log(obj);
                            },
                            error: function (obj, error) {
                                console.log(err);
                            }
                        });
                    }
                },
                error(error) {
                    console.log(error);
                }
            });

        });
    }
}


