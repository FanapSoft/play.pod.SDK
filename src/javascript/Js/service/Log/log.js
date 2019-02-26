(function () {

    function Log(options) {
        var __self = this,
            __nameSpace = (options && typeof options.nameSpace === "string") ? options.nameSpace : "",
            __save = (options && typeof options.save === "boolean") ? options.save : false,
            __addTime = (options && typeof options.addTime === "boolean") ? options.addTime : false,
            __enable = (options && typeof options.enable === "boolean") ? options.enable : true,
            __logs = [],
            __instances = [],
            __console = (options && typeof options.console === "boolean") ? options.console : true,
            __nameSpaceInConsole = (options && typeof options.nameSpaceInConsole === "boolean") ? options.nameSpaceInConsole : false,
            __level = (options && typeof options.level === "number") ? options.level : 1,
            
            __defaultFunction = function () {};

        var __init = function () {

            },

            __log = function (params,arg) {

                var nameSpace = params.nameSpace;
                if(__save && arg) {
                    var str =  nameSpace;
                    for (var i = 0; i < arg.length; i++) {
                        var data = arg[i];

                        if(typeof data == "object" || Array.isArray(data)) {
                            str += (" " + JSON.stringify(data));
                        } else {
                            str += (" " + data);
                        }
                    }
                    var logStr = "";

                    if(__addTime) {
                        var date = new Date();

                        logStr = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " ";
                    }

                    logStr += (str + "\n");

                    __logs.push({
                        level : params.level || __level,
                        log : logStr
                    });
                }
            },

            __trace = function (params,arg) {
                if(!__enable) return __defaultFunction;

                var nameSpace = params.nameSpace;
                __log(params,arg);

                if(__console) {

                    if(__nameSpaceInConsole && Array.prototype.unshift) {
                        Array.prototype.unshift.call(arg, nameSpace);
                    }
                    // console.trace.apply(console, arg);

                    if(Function && Function.prototype) {
                        var args = Array.prototype.slice.call(arg);
                        args.unshift(console);
                        return Function.prototype.bind.apply(console.trace, args);
                    } else {
                        return __defaultFunction;
                    }
                } else {
                    return __defaultFunction;
                }
            },

            __info = function (params,arg) {
                var nameSpace = params.nameSpace;

                if(!__enable) return __defaultFunction;

                __log(params,arg);

                if(__console) {
                    if(__nameSpaceInConsole && Array.prototype.unshift) {
                        Array.prototype.unshift.call(arg, nameSpace);
                    }
                    // console.log.apply(console, arg);
                    if(Function && Function.prototype) {
                        var args = Array.prototype.slice.call(arg);
                        args.unshift(console);
                        return Function.prototype.bind.apply(console.log, args);
                    } else {
                        return __defaultFunction;
                    }

                } else {
                    return __defaultFunction;
                }

            },

            __config = function (config) {
                if(config) {
                    if(typeof config.enable === "boolean") {
                        __enable = config.enable;
                    }
                }
            };


        function Instance(params) {

            var __nSpace = params && params.nameSpace,
                enable = (params && typeof params.enable === "boolean") ? params.enable : true,
                level = (params && typeof params.enable === "number") ? params.level : __level;

            this.info = function () {
                if(!enable) return __defaultFunction;
                return __info({
                    nameSpace : __nSpace,
                    level : level
                }, arguments);
            };
            this.trace = function () {
                if(!enable) return __defaultFunction;
                return __trace({
                    nameSpace : __nameSpace,
                    level : level
                }, arguments);
            };
            this.config = function (cgf) {
                // TODO
            };
            this.getInstance = function (params) {
                var log = new Instance(params);

                __instances.push(log);
                return log;
            };
        }

        __self.info = function(){
            return __info({
                nameSpace :__nameSpace,
            }, arguments);
        };

        __self.trace = function(){
            return __trace({
                nameSpace :__nameSpace
            }, arguments);
        };

        __self.clear = function () {
            __logs = [];
        };

        __self.getInstance = function (params) {
            var log = new Instance(params);

            __instances.push(log);
            return log;
        };

        __self.getLogData = function (params) {
            var tmpLog = [];

            for (var i = 0; i < __logs.length; i++) {

                if(params) {
                    if(typeof params.minLevel === "number" && __logs[i].level < params.minLevel) {
                        continue;
                    }

                    if(typeof params.maxLevel === "number" && __logs[i].level > params.maxLevel) {
                        continue;
                    }
                }
                tmpLog.push(__logs[i].log);
            }

            return tmpLog.join("");
        };

        __self.config = __config;

        __init();
    }

    if(typeof exports !== 'undefined' && module && module.exports) {
        module.exports = Log;
    } else {
        if(!window.TIS) {
            window.TIS = {};
        }
        TIS.Log = Log;
    }

})();