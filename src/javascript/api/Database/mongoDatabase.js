var mongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;
/**
 * @class Database
 * @constructor
 *
 *
 * @param {string}  options
 * @param {string}  options.name
 * @param {Int}  options.version
 * @param {Boolean}  options.debugMode
 * @param {Function}  [options.onSuccess]
 * @param {Function}  [options.onUpgradeNeeded]
 *
 * */
function Database(options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/

    var __self = this,
        __mongodb,
        __name = options.name,
        __version = options.version,
        __debugMode = options.debugMode || false,
        __onSuccess = options.onSuccess,
        __onUpgradeNeeded = options.onUpgradeNeeded,
        __onError = options.onError,
        __indexedDB = undefined,
        __collections = {},
        __enable =  (typeof options.enable == "boolean" ? options.enable: true),
        __db = undefined;



    var updateQueue = [],
        isLock = false;

    //                          ---------->    P U B L I C   <----------

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/


    /**
     *  init data base
     * @method __init
     * @private
     *
     * */
    var __init = function () {
            __initMongodb(__onSuccess);
        },

        __initMongodb = function (callback) {
            console.log("__initMongodb");
            // var url = "mongodb://localhost:" + 27017 + "/" + __name;
            if(! __enable) {
                callback(__self);
                return;
            }
            var url = "mongodb://TIS_SERVICEAdmin:pass@localhost:" + 27017 + "/" + __name;
            console.log("DB URL",url);
            mongoClient.connect(url, {  useNewUrlParser: true,},function (err, client) {

                if (err) {
                    console.log("ERROR IN OPEN CONNECTION ", err);
                    setTimeout(function () {
                        console.log("------------------timeout");
                        __initMongodb(callback);
                    },5000);
                    return;
                }
                __mongodb = client.db(__name);

                __mongodb.listCollections().toArray(function (err, items) {
                    if(!err && Array.isArray(items) &&
                        items.length > 0 ) {
                        for (var i = 0; i < items.length; i++) {
                            var name = items[i].name;
                            __collections[name] = __mongodb.collection(name);
                        }
                    }
                    callback();
                    __onUpgradeNeeded();
                });

            });
        },

        __createCollection = function (cData, callback) {
            __mongodb.createCollection(cData.identity, {autoIndexId: cData.autoPK}, function (err, collection) {
                if(!err) {
                    __createCollectionIndex(collection, cData.attributes);
                }
                callback(err, collection);
            });
        },

        __createCollectionIndex = function(collection,attributes) {
            if(attributes) {
                for(var attrName in attributes) {
                    if(attributes[attrName].unique || attributes[attrName].index) {
                        collection.ensureIndex(attrName,{unique: attributes[attrName].unique,sparse: true});
                    }
                }
            }
        };

    /**
     * default error callback
     * @method __defaultErrorCallback
     * @private
     *
     * */
    var __defaultErrorCallback = function (e) {
        console.error('An IndexedDB error has occurred', e);
    };

    /**
     * default success callback
     * @method __defaultErrorCallback
     * @private
     *
     * */
    var __defaultSuccessCallback = function (e) {
        console.error('success', e);
    };

    var __log = options.log || function() {};


    //                          ---------->    P U B L I C   <----------
    //                          ---------->    P U B L I C   <----------

    /*==================================================================================================================
     *                                 O V E R R I D E     M E T H O D
     *================================================================================================================*/

    /*==================================================================================================================
     *                                  P U B L I C      M E T H O D
     *================================================================================================================*/

    /**
     *
     * create table. shoud call in onUpgradeNeeded callback
     * @method createTable
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {Object} options.parameters
     * @param {Object} options.indexes
     *      @param {Object}  options.indexes.name
     * @param {Object} options.name
     * @param {Function}       [options.onComplete]
     * @param {Function}       [options.onError]
     *
     *
     * */
    this.createTable = function (options) {
        var tableName = options.name,
            parameters = options.parameters || {},
            indexes = options.indexes || [],
            onComplete = options.onComplete,
            onError = options.onError;

        if(!__enable) {
            onComplete && onComplete();
            return;
        }
        var attributes = {};

        for (var i = 0; i < indexes.length; i++) {
            var indexData = indexes[i];
            attributes[indexData.name]= {
                index: true,
                unique : (indexData.parameters && indexData.parameters.unique) ? true : false
            };

        }

        __mongodb.listCollections().toArray(function (err, items) {

            var tableExist = false;

            for (var i = 0; i < items.length; i++) {

                if(items[i].name == tableName) {
                    tableExist = true;
                    break;
                }

            }

            if(!err && Array.isArray(items) &&
                items.length > 0 &&
                tableExist) {
                if(attributes.length>0) {
                    __createCollectionIndex(__mongodb.collection(tableName), attributes);
                }
                onComplete && onComplete();
            } else {
                var data = {
                    identity: tableName,
                    autoPK: false,
                    attributes : attributes
                };
                if(typeof parameters.autoIncrement == "boolean") {
                    data.autoPK = parameters.autoIncrement;
                }

                __createCollection(data,function(err, collection) {

                    if(err) {
                        onError && onError();
                    } else {
                        __collections[tableName] = collection;

                        onComplete && onComplete();
                    }
                });
            }
        });
    };

    /**
     * @method addToTable
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {String} options.transactionMode
     * @param {Object} options.data
     * @param {Function}       [options.onComplete]
     * @param {Function}       [options.onError]
     *
     * */
    this.addToTable = function (options) {
        var tableName = options.name,
            data = options.data || [],
            value, index,
            transactionMode = options.transactionMode || __self.TRANSACTION_READWRITE || "readwrite",
            onComplete = options.onComplete,
            onError = options.onError;

        if(!__enable) {
            onComplete && onComplete();
            return;
        }
        if(__collections[tableName]) {

            var length = data.length,
                current = 0;

            function check() {
                if(current == length) {
                    onComplete && onComplete();
                }
            }
            for (var i = 0; i < length; i++) {
                value = data[i].value;
                index = data[i].index;

                var dbData = {
                    value: value
                };
                if(index) {
                    dbData._id = index;
                }
                dbData.createdAt = new Date();

                __collections[tableName].insertOne(dbData,function (err,data) {
                    current += 1;
                    check();
                });

            }

        }
    };

    /**
     * @method removeFromTable
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {String} options.index
     * @param {Object} options.transactionMode
     * @param {Function}       [options.onSuccess]
     * @param {Function}       [options.onError]
     *
     * */
    this.removeFromTable = function (options) {
        var tableName = options.name,
            index = options.index,
            onSuccess = options.onSuccess,
            onError = options.onError;

        if(!__enable) {
            onSuccess && onSuccess();
            return;
        }
        if(__collections[tableName]) {
            __collections[tableName].removeOne({_id: index}, function (err) {
                if(err) {
                    onSuccess && onSuccess();
                } else {
                    onError && onError();
                }

            });
        }
    };

    /**
     * @method getFromTableWithIndex
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {String} options.index
     * @param {Function}       [options.onSuccess]
     * @param {Function}       [options.onError]
     *
     * */
    this.getFromTableWithIndex = function (options) {
        var tableName = options.name,
            index = options.index,
            onSuccess = options.onSuccess,
            onError = options.onError;

        if(!__enable) {
            onSuccess && onSuccess();
            return;
        }
        if(isLock) {
            updateQueue.push({
                options : options,
                callback : __self.getFromTableWithIndex
            });
        } else {
            if(__collections[tableName]) {
                __collections[tableName].findOne({_id:index},function (err,data) {
                    if(err) {
                        onError && onError();
                    } else {
                        onSuccess && onSuccess(data && data.value);
                    }

                    isLock = false;
                    if(updateQueue.length>0) {
                        var queueData = updateQueue.splice(0, 1)[0];
                        queueData.callback(queueData.options);
                    }
                });
            }
        }
    };

    /**
     * @method getFromTableWithIndex
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {String} options.key
     * @param {Function}       [options.onSuccess]
     * @param {Function}       [options.onError]
     *
     * */
    this.getFromTableWithObjectKey = function (options) {
        var tableName = options.name,
            key = options.key,
            value = options.value,
            onSuccess = options.onSuccess,
            onError = options.onError;

        onSuccess && onSuccess();
        return;

        var objectStore = __db.transaction([tableName]).objectStore(tableName);

        var request =objectStore.openCursor();

        request.onerror = onError || __defaultErrorCallback;
        var data = {};
        request.onsuccess = function (e) {
            var cursor = e.target.result;

            if (cursor) {
                if (cursor.value[key]) {
                    if(value) {
                       if(cursor.value[key] == value) {
                           data[cursor.key] = cursor.value;
                       }
                    } else {
                        data[cursor.key] = cursor.value;
                    }

                }
                cursor.continue();
            } else {
                onSuccess(data);
            }
        };

    };

    this.getAllItemFromTable = function (options) {
        var tableName = options.name,
            onSuccess = options.onSuccess,
            onError = options.onError;

        if(!__enable) {
            onSuccess && onSuccess();
            return;
        }
        if(__collections[tableName]) {
            __collections[tableName].find({}).toArray(function (err,data) {
                if(err) {
                    onError && onError();
                } else {
                    var retData = {};
                    for (var i = 0; i < data.length; i++) {
                        retData[data[i]._id] = data[i].value;
                    }
                    onSuccess && onSuccess(retData);
                }
            });
        }
    };

    /**
     * @method updateTable
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {String} options.index
     * @param {String} options.value
     * @param {Function}       [options.onSuccess]
     * @param {Function}       [options.onError]
     * @param {Function}       [options.onBeforeUpdate]
     *
     * */


    this.updateTable = function (options,dataId) {
        var tableName = options.name,
            index = options.index,
            value = options.value,
            onSuccess = options.onSuccess,
            onBeforeUpdate = options.onBeforeUpdate,
            transactionMode = __self.TRANSACTION_READWRITE || "readwrite",
            objectStore,
            onError = options.onError;
        if(!__enable) {
            onSuccess && onSuccess();
            return;
        }

        // onSuccess && onSuccess();

        if(__collections[tableName]) {

            if(index && value) {
                var setData = {};
                if(typeof value == "object") {

                    for(var key in value) {
                        setData["value." + key] = value[key];
                    }
                } else {
                    setData = value;
                }
                __collections[tableName].updateOne({_id: index}, {$set: setData}, function (err) {
                    if(err) {
                        onError &&onError();
                    } else {
                        onSuccess &&onSuccess();
                    }
                });
            } else if(index && !value) {
                if(!isLock) {
                    isLock = true;
                    __collections[tableName].findOne({_id: index}, function (err,data) {
                        if(err) {
                            onError &&onError();
                            isLock = false;
                            if(updateQueue.length>0) {
                                var queueData = updateQueue.splice(0, 1)[0];
                                queueData.callback(queueData.options);
                            }
                        } else {
                            if(onBeforeUpdate) {
                                var newData =onBeforeUpdate(data && data.value);
                                if(newData) {
                                    __collections[tableName].updateOne({_id: index}, {$set: {value: newData}},function(err) {
                                        if(err) {
                                            onError && onError();
                                        } else {

                                            onSuccess &&onSuccess();
                                        }
                                        isLock = false;
                                        if(updateQueue.length>0) {
                                            var queueData = updateQueue.splice(0, 1)[0];
                                            queueData.callback(queueData.options);
                                        }
                                    });
                                } else {
                                    onSuccess && onSuccess();
                                    isLock = false;
                                    if(updateQueue.length>0) {
                                        var queueData = updateQueue.splice(0, 1)[0];
                                        queueData.callback(queueData.options);
                                    }
                                }

                            } else {
                                isLock = false;
                                if(updateQueue.length>0) {
                                    var queueData = updateQueue.splice(0, 1)[0];
                                    queueData.callback(queueData.options);
                                }
                            }
                        }
                    });
                } else {
                    updateQueue.push({
                        options : options,
                        callback : __self.updateTable
                    });
                }

            }

        }
    };

    /**
     * @method deleteDatabase
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {Function}       [options.onSuccess]
     * @param {Function}       [options.onError]
     * @param {Function}       [options.onBlocked]
     *
     * */
    this.deleteDatabase = function (options) {
        var databaseName = options.name,
            onSuccess = options.onSuccess,
            onError = options.onError,
            onBlocked = options.onBlocked;

        onSuccess && onSuccess();
    };

//    this.getAllTableName = function() {
//        var allTabelName = [];
//        var tables = __db.objectStoreNames;
//        console.log(tables);
//        for(var index in tables){
//            console.log(tables[index]);
//            allTabelName.push(tables[index]);
//        }
//
//        return allTabelName;
//    };

    /**
     * check is table(object Store) is exist
     * @method isTableExist
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @return {Boolean}
     * */
    this.isTableExist = function (tableName) {

        return true;

        return __db.objectStoreNames.contains(tableName)
    };

    /**
     *
     * @method openDatabase
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {String} options.version
     * @param {Function}       [options.onSuccess]
     * @param {Function}       [options.onUpgradeNeeded]
     * @param {Function}       [options.onBlocked]
     *
     * */
    this.openDatabase = function (options) {
        var name = options.name,
            version = options.version,
            onUpgradeNeeded = options.onUpgradeNeeded,
            onBlocked = options.onBlocked,
            onSuccess = options.onSuccess,
            onError = options.onError;

        onSuccess && onSuccess();
    };

    this.close = function () {
        __db.close();
    };

    __init();
};

Database.prototype.TRANSACTION_READONLY = "readonly";
Database.prototype.TRANSACTION_READWRITE = "readwrite";
Database.prototype.TRANSACTION_VERSIONCHANGE = "versionchange";


module.exports = Database;