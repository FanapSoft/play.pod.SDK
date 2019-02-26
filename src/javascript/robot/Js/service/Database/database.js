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

if(typeof TIS == "undefined") {
    TIS = {};
}
TIS.Database = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/

    var __self = this,
        __name = options.name,
        __version = options.version,
        __debugMode = options.debugMode || false,
        __onSuccess = options.onSuccess,
        __onUpgradeNeeded = options.onUpgradeNeeded,
        __onError = options.onError,
        __indexedDB = undefined,
        __db = undefined;

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
        __indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        if (!__indexedDB) {
            //__indexedDB =  window.shimIndexedDB && window.shimIndexedDB.__useShim();
            __indexedDB = window.shimIndexedDB;
            __indexedDB.__useShim();     // force to use polyfill
            //__indexedDB.__debug(true);   // enable debug
            console.log("Your Browser does not support IndexedDB Database");
            //return 0;
        }

        if (__debugMode) {
            __self.deleteDatabase(
                {
                    name: __name,
                    onSuccess : function (e) {
                        __self.openDatabase({
                            name: __name,
                            version: __version,
                            onSuccess: __onSuccess,
                            onUpgradeNeeded: __onUpgradeNeeded
                        });
                    }
                });
        } else {

            var dbParam = {
                name: __name,
                onSuccess: __onSuccess,
                onUpgradeNeeded: __onUpgradeNeeded,
                onError: function (e) {
                    console.log("can not open data base");
                    console.log("The requested version is less than the existing version");

                    if (__onError) {
                        __onError();
                    } else {
                        if (e && e.target && e.target.error) {
                            var err = e.target.error;

                            if (err.name == "VersionError" || err.name == "InvalidStateError") {
                                __self.openDatabase({
                                    name: __name,
                                    onSuccess: __onSuccess,
                                    onUpgradeNeeded: __onUpgradeNeeded
                                });
                            }
                        }
                    }
                }
            };

            if(typeof  __version == "number") {
                dbParam.version = __version;
            }
            __self.openDatabase(dbParam);
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

    var __log =
        options &&
        options.logger &&
        options.logger.getInstance({nameSpace : "Database("+__name+")",level:2}).info ||
        function () {};


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


        if (!__db.objectStoreNames.contains(tableName)) {
            var objectStore = __db.createObjectStore(tableName, parameters);

            var index, indexParam;
            for (var i = 0; i < indexes.length; i++) {
                index = indexes[i];
                indexParam = index.parameters || {};
                objectStore.createIndex(index.name, index.name, indexParam);
            }

            if (onComplete) {
                objectStore.transaction.oncomplete = function (e) {
                    onComplete();
                };
            }
        } else {
            if (onComplete) {
                onComplete();
            }
            console.warn(tableName + " table is exist!");
        }
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
     * @param {Function}       [options.onAbort]
     *
     * */
    this.addToTable = function (options) {
        var tableName = options.name,
            data = options.data || [],
            value, index,
            transactionMode = options.transactionMode || __self.TRANSACTION_READWRITE || "readwrite",
            onComplete = options.onComplete,
            onAbort = options.onAbort,
            onError = options.onError;

        var transaction = __db.transaction([tableName], transactionMode);
        var objectStore = transaction.objectStore(tableName);

        var completed = 0;
        var completedCalled = false;

        function completedCall(e,forceCall) {
            completed += 1;

            if((completed === data.length && !completedCalled) || (! completedCalled && forceCall)) {
                onComplete && onComplete(e);
                completedCalled = true;
            }
        }

        for (var i = 0; i < data.length; i++) {
            value = data[i].value;
            index = data[i].index;

            var objectStoreRequest;
            if (index) {
                objectStoreRequest = objectStore.add(value, index);
            } else {
                objectStoreRequest = objectStore.add(value);
            }

            // objectStoreRequest.onsuccess = function(e) {
            //     console.log("addToTable_1");
            //     completedCall(e,false);
            // };
        }


        transaction.oncomplete = function (e) {
            completedCall(e,true);

        };

        transaction.onerror = onError || __defaultErrorCallback;
        transaction.onabort = function (e) {
            onAbort && onAbort(e);
        };

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
            transactionMode = options.transactionMode || __self.TRANSACTION_READWRITE || "readwrite",
            onSuccess = options.onSuccess,
            onError = options.onError;

        var request = __db.transaction([tableName], transactionMode)
            .objectStore(tableName)
            .delete(index);

        if (onSuccess) {
            request.onsuccess = function (e) {
                onSuccess(e);
            };

        }
        if (onError) {
            request.onerror = function (e) {
                onError(e);
            };
        }


    };


    /**
     * @method removeAllFromTable
     * @public
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {Object} options.transactionMode
     * @param {Function}       [options.onSuccess]
     * @param {Function}       [options.onError]
     *
     * */
    this.removeAllFromTable = function (options) {
        var tableName = options.name,
            transactionMode = options.transactionMode || __self.TRANSACTION_READWRITE || "readwrite",
            onSuccess = options.onSuccess,
            onError = options.onError;

        var request = __db.transaction([tableName], transactionMode)
            .objectStore(tableName)
            .clear();

        if (onSuccess) {
            request.onsuccess = function (e) {
                onSuccess(e);
            };

        }
        if (onError) {
            request.onerror = function (e) {
                onError(e);
            };
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
            transactionMode = options.transactionMode || "readonly",
            onError = options.onError;

        try {
            var objectStore = __db.transaction([tableName],transactionMode).objectStore(tableName);
            var request =objectStore.get(index);
            request.onerror = onError || __defaultErrorCallback;

            request.onsuccess = function (e) {
                onSuccess(e.target.result,objectStore);
            };
        } catch(e){
            onError && onError(e);
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

        var objectStore = __db.transaction([tableName])
            .objectStore(tableName),
            request;

        if(typeof  objectStore.getAllKeys === "function") {
            request =objectStore.getAllKeys();
            request.onerror = onError || __defaultErrorCallback;
            request.onsuccess = function (e) {
                var keys = e.target.result;
                var data = {};
                var hasError = false;

                function get(index) {
                    if(index <keys.length) {
                        var request = objectStore.get(keys[index]);
                        request.onerror = function (e) {
                            if(!hasError) {
                                hasError = true;
                                if(onError) {
                                    onError(e);
                                } else {
                                    __defaultErrorCallback(e);
                                }
                            }
                        };
                        request.onsuccess = function (e) {
                            data[keys[index]] = e.target.result;
                            get(index + 1);
                        };
                    } else {
                        if(!hasError) {
                            onSuccess(data);
                        }

                    }
                }

                get(0);
            };

        } else {
            request = objectStore.openCursor();
            request.onerror =  onError || __defaultErrorCallback;
            var data = {};
            request.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    data[cursor.key] = cursor.value;

                    cursor.continue();
                } else {
                    onSuccess(data);
                }
            };
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
            successCalled = false,
            onBeforeUpdate = options.onBeforeUpdate,
            transactionMode = __self.TRANSACTION_READWRITE || "readwrite",
            objectStore,
            onError = options.onError,
            isAbort = false;


        function callSuccess(e) {
            __log("updateTable--callSuccess", dataId,index);

            if(!successCalled) {
                if(onSuccess) onSuccess(e);
                successCalled = true;
            }
        }

        __log("updateTable--1", dataId,index);
        function putToTable(data) {
            __log("updateTable--8",dataId, index);
            var updateRequest = objectStore.put(data,index);

            updateRequest.onerror = function(e){
                __log("updateTable--10", dataId,index,e);
            };

            updateRequest.onsuccess = function (e) {
                __log("updateTable--9", dataId,index);
                callSuccess(e);
            };

        }
        var transaction = __db.transaction([tableName], transactionMode);

        transaction.oncomplete = function(e) {
            __log("updateTable--11", dataId,index);
            callSuccess(e);
        };

        transaction.onerror = function(e) {
            __log("updateTable--12", dataId,index,e);
            if(!isAbort) {
                if(onError) {
                    onError(e);
                } else {
                    __defaultErrorCallback(e);
                }
            }
        };

        objectStore = transaction.objectStore(tableName);

        var request = objectStore.get(index);

        request.onerror = function(e){
            __log("updateTable -- ERROR", dataId,index,e);
            if(onError) {
                onError(e);
            } else {
                __defaultErrorCallback(e);
            }
        };

        request.onsuccess = function (e) {
            __log("updateTable--2", dataId,index);
            var data = e.target.result;

            if(typeof onBeforeUpdate === "function") {
                __log("updateTable--3", dataId,index,data);
                data = onBeforeUpdate(data);
                if(data === false) {
                    __log("updateTable--4",dataId, index);
                    isAbort = true;
                    transaction.abort();
                    return;
                }
            } else {
                __log("updateTable--5", dataId,index);
                if (typeof value === "object" && typeof data === "object" && data !== null && value !== null) {
                    for (var keyName in value) {
                        data[keyName] = value[keyName];
                    }
                } else {
                    data = value;
                }
            }

            __log("updateTable--6", dataId,index);
            putToTable(data);

        };

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

        var delRequest = __indexedDB.deleteDatabase(databaseName);

        delRequest.onsuccess = function () {
            if (onSuccess)
                onSuccess();
            else
                console.log(__name + " database Deleted successfully");
        };
        delRequest.onerror = function () {
            if (onError)
                onError();
            else
                console.log("Couldn't delete " + __name + " database");
        };
        delRequest.onblocked = function () {
            if (onBlocked)
                onBlocked();
            else
                console.log("Couldn't delete " + __name + " database due to the operation being blocked");
        };
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

        if (!name) {
            console.error("set database name.");
            return;
        }

        var request;
        if(typeof version == "number") {
            request = __indexedDB.open(__name,version);
        } else {
            request = __indexedDB.open(__name);
        }


        request.onupgradeneeded = function (e) {
            console.log("upgrade...");
            __db = e.target.result;
            __version = __db.version;
            e.target.transaction.onerror = __defaultErrorCallback;
            if (onUpgradeNeeded)
                onUpgradeNeeded(e);
        };

        request.onsuccess = function (e) {
            // console.log("success open db... " + name);
            __db = e.target.result;
            __version = __db.version;
            if (onSuccess)
                onSuccess(e);
        };

        request.onblocked = function (e) {
            // If some other tab is loaded with the database, then it needs to be closed
            // before we can proceed.
            if (onBlocked)
                onBlocked(e);
            console.error("Please close all other tabs with this site open!");
        };

        request.onerror = function (e) {
            // If some other tab is loaded with the database, then it needs to be closed
            // before we can proceed.

            console.log("eror open DB",e);
            onError && onError(e);
        };
    };

    this.close = function () {
        __db.close();
    };

    __init();
};

TIS.Database.prototype.TRANSACTION_READONLY = "readonly";
TIS.Database.prototype.TRANSACTION_READWRITE = "readwrite";
TIS.Database.prototype.TRANSACTION_VERSIONCHANGE = "versionchange";

