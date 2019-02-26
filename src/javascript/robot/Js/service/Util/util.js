/**
 *
 * @class Util
 * @constructor
 *
 * */

var TIS = TIS || {};
if (!TIS._Util)
    TIS._Util = {};
// for user
if (!TIS.Util)
    TIS.Util = {};
(function () {
    if (typeof String.prototype.contains != 'function') {
        String.prototype.contains = function (str, startIndex) {
            return ''.indexOf.call(this, str, startIndex) !== -1;
        };
    }
    function jalCal(jy) {
        // Jalaali years starting the 33-year rule.
        var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210
                , 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
            ]
            , bl = breaks.length
            , gy = jy + 621
            , leapJ = -14
            , jp = breaks[0]
            , jm
            , jump
            , leap
            , leapG
            , march
            , n
            , i;

        if (jy < jp || jy >= breaks[bl - 1])
            throw new Error('Invalid Jalaali year ' + jy)

        // Find the limiting years for the Jalaali year jy.
        for (i = 1; i < bl; i += 1) {
            jm = breaks[i]
            jump = jm - jp
            if (jy < jm)
                break
            leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
            jp = jm
        }
        n = jy - jp;

        // Find the number of leap years from AD 621 to the beginning
        // of the current Jalaali year in the Persian calendar.
        leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
        if (mod(jump, 33) === 4 && jump - n === 4)
            leapJ += 1

        // And the same in the Gregorian calendar (until the year gy).
        leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150

        // Determine the Gregorian date of Farvardin the 1st.
        march = 20 + leapJ - leapG

        // Find how many years have passed since the last leap year.
        if (jump - n < 6)
            n = n - jump + div(jump + 4, 33) * 33
        leap = mod(mod(n + 1, 33) - 1, 4)
        if (leap === -1) {
            leap = 4
        }

        return {
            leap: leap
            , y: gy
            , march: march
        }
    }

    function j2d(jy, jm, jd) {
        var r = jalCal(jy);
        return g2d(r.y, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
    }

    function d2j(jdn) {
        var gy = d2g(jdn).y // Calculate Gregorian year (gy).
            , jy = gy - 621
            , r = jalCal(jy)
            , jdn1f = g2d(gy, 3, r.march)
            , jd
            , jm
            , k;

        // Find number of days that passed since 1 Farvardin.
        k = jdn - jdn1f;
        if (k >= 0) {
            if (k <= 185) {
                // The first 6 months.
                jm = 1 + div(k, 31)
                jd = mod(k, 31) + 1
                return {
                    y: jy,
                    m: jm,
                    d: jd
                }
            } else {
                // The remaining months.
                k -= 186
            }
        } else {
            // Previous Jalaali year.
            jy -= 1
            k += 179
            if (r.leap === 1)
                k += 1
        }
        jm = 7 + div(k, 30);
        jd = mod(k, 30) + 1;
        return {
            y: jy,
            m: jm,
            d: jd
        }
    }

    function g2d(gy, gm, gd) {
        var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
            + div(153 * mod(gm + 9, 12) + 2, 5)
            + gd - 34840408;
        d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
        return d
    }

    function d2g(jdn) {
        var j
            , i
            , gd
            , gm
            , gy;
        j = 4 * jdn + 139361631;
        j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
        i = div(mod(j, 1461), 4) * 5 + 308;
        gd = div(mod(i, 153), 5) + 1;
        gm = mod(div(i, 153), 12) + 1;
        gy = div(j, 1461) - 100100 + div(8 - gm, 6);
        return {
            y: gy
            , m: gm
            , d: gd
        }
    }

    function div(a, b) {
        return ~~(a / b);
    }

    function mod(a, b) {
        return a - ~~(a / b) * b;
    }


    //Math.log2 = Math.log2 || function(x){return Math.log(x)*Math.LOG2E;};
    Math.log2 = Math.log2 || function(x){return Math.log(x) / Math.log(2)};


    TIS.Util.log = function(number,base) {
        return Math.log(number) / Math.log(base);
    };

    TIS.Util.padNumber = function (n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };

    /**
     * @method generateRandomInt
     * @public
     *
     * @param {Number} min
     * @param {Number} max
     *
     * */
    TIS.Util.generateRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * @method generateUUID
     * @public
     *
     * @param {Number} sectionCount
     * */
    TIS.Util.generateUUID = function (sectionCount) {
        var d = new Date().getTime();
        var textData = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

        if (sectionCount == 1) {
            textData = 'xxxxxxxx';
        }

        if (sectionCount == 2) {
            textData = 'xxxxxxxx-xxxx';
        }

        if (sectionCount == 3) {
            textData = 'xxxxxxxx-xxxx-4xxx';
        }

        if (sectionCount == 4) {
            textData = 'xxxxxxxx-xxxx-4xxx-yxxx';
        }

        var uuid = textData.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);

            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    };

    TIS.Util.generateUUIDFromTime = function () {
        return (new Date().getTime());
    };

    /**
     * @method generateRandomFloat
     * @public
     *
     * @param {Number} min
     * @param {Number} max
     *
     * */
    TIS.Util.generateRandomFloat = function (min, max) {
        return Math.random() * (max - min) + min;
    };

    /**
     * @method degToRad
     * @public
     *
     * @param {Number} Deg
     *
     * */
    TIS.Util.degToRad = function (Deg) {

        return Deg * Math.PI / 180;
    };

    /**
     * @method radToDeg
     * @public
     *
     * @param {Number} Rad
     *
     * */
    TIS.Util.radToDegInt = function (Rad) {

        return (Rad * 180 / Math.PI) | 0;
    };

    /**
     * @method radToDeg
     * @public
     *
     * @param {Number} Rad
     *
     * */
    TIS.Util.radToDeg = function (Rad) {

        return Rad * 180 / Math.PI;
    };

    TIS.Util.isPowerOfTwo = function (width, height) {
        return (0 !== (width & (width - 1))) || (0 !== (height & (height - 1)));
    };

    TIS.Util.convertImageUrlToBase64URL = function (params) {
        var url = params.url,
            callback = params.callback,
            outputFormat = params.outputFormat;

        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            var canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'), dataURL;
            canvas.height = this.height;
            canvas.width = this.width;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
            canvas = null;
        };
        img.src = url;
    };

    /**
     * @method getFileName
     * @public
     *
     * @param {String} getFileName
     *
     * */
    TIS.Util.getFileName = function (FullPath) {
        return FullPath.replace(/^.*[\\\/]/, '').split(".")[0];
    };

    TIS.Util.isTouchable = function () {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    };

    TIS.Util.geoLocationDistance = function(geoData1, geoData2) { // Points are Geolocation.coords objects
        var rad = TIS.Util.degToRad;
        var R = 6371; // earth's mean radius in km
        var dLat  = rad(geoData2.latitude - geoData1.latitude);
        var dLong = rad(geoData2.longitude - geoData1.longitude);

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(rad(geoData1.latitude)) * Math.cos(rad(geoData2.latitude)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;

        return parseFloat(d.toFixed(3));
    };

    TIS.Util.toEnDigit = function (persianNumber) {
        return persianNumber.replace(/[\u06F0-\u06F9]+/g, function (digit) {
            var digits = [], ENDigit = [];
            for (var i = 0, len = digit.length; i < len; i++) {
                digits.push(digit.charCodeAt(i));
            }

            for (var j = 0, leng = digits.length; j < leng; j++) {
                ENDigit.push(String.fromCharCode(digits[j] - 1728));
            }

            return ENDigit.join('');
        });
    };

    TIS.Util.toFaDigit = function (enNumber) {
        if(typeof enNumber === "number") {
            enNumber += "";
        }
        return enNumber.replace(/\d+/g, function(digit) {
            var ret = '';
            for (var i = 0, len = digit.length; i < len; i++) {
                ret += String.fromCharCode(digit.charCodeAt(i) + 1728);
            }

            return ret;
        });
    };

    TIS.Util.getStyleSheet = function (title) {
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];
            if (sheet.title == title) {
                return sheet;
            }
        }
    };

    TIS.Util.createStyleSheet = function () {
        var style = document.createElement("style");

        // Add a media (and/or media query) here if you'd like!
        // style.setAttribute("media", "screen")
        // style.setAttribute("media", "only screen and (max-width : 1024px)")

        // WebKit hack :(
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.head.appendChild(style);

        return style.sheet;
    };

    TIS.Util.computeSpriteData = function (customSize, spriteData, imgSize) {
        var returnData = {
            width: customSize.width,
            height: customSize.height
        };

        var backSize = {
            width: parseInt((imgSize.width * customSize.width) / spriteData.width),
            height: parseInt((imgSize.height * customSize.height) / spriteData.height)
        };
        returnData.backgroundSize = backSize;
        returnData.x = TIS.Util.convertToRange(spriteData.x, [0, imgSize.width], [0, backSize.width]);
        returnData.y = TIS.Util.convertToRange(spriteData.y, [0, imgSize.height], [0, backSize.height]);

        return returnData;
    };

    TIS.Util.isCellphoneNumber = function (number) {
        return (number.length == 11 && /^09[\d]{9}$/.test(number));
    };

    /**
     * @method isApp
     * @public
     *
     * @return {Boolean} is mubile app
     *
     * */
    TIS.Util.isApp = function () {
        if(typeof document !== "undefined") {
            return (document.URL.indexOf('http://') === -1
                && document.URL.indexOf('https://') === -1 && document.URL.indexOf('file://') >= 0);
        } else {
            return false;
        }

    };
    /**
     * @method getDataFromUrl
     * @public
     *
     * @param {String} url
     *
     * */
    TIS.Util.getUrlData = function (url) {
        var data = url.match(/\?([^#]*)/i);

        if (!data) {
            return;
        }
        var url_data = data[1];
        // separate the data into an array, in case the are multiple pairs name=value
        var ar_url_data = url_data.split('&');

        // traverse the array, and adds into an object elements name:value
        var data_url = {};
        for (var i = 0; i < ar_url_data.length; i++) {
            var ar_val = ar_url_data[i].split('=');           // separate name and value from each pair
            data_url[ar_val[0]] = ar_val[1];
            /*
             if(ar_val[1].indexOf("%22") !== -1)
             {
             data_url[ar_val[0]] =ar_val[1].split("%22")[1];
             }
             else
             {
             data_url[ar_val[0]] = ar_val[1];
             }
             */

        }
        return data_url;
    };


    TIS.Util.getQueryStringData = function (url) {
        var data = url.match(/\?([^#]*)/i);

        if (!data) {
            return;
        }
        var url_data = data[1];
        // separate the data into an array, in case the are multiple pairs name=value
        var ar_url_data = url_data.split('&');

        // traverse the array, and adds into an object elements name:value
        var data_url = [];
        for (var i = 0; i < ar_url_data.length; i++) {
            var ar_val = ar_url_data[i].split('=');           // separate name and value from each pair
            data_url[ar_val[0]] = ar_val[1];

            data_url.push({
                name: ar_val[0],
                value: ar_val[1]
            });
        }
        return data_url;
    };

    TIS.Util.loadContent = function (content, callbacks) {
        var loadContent = {};

        function checkLoad() {

            var allIsLoad = true;

            for (var path in loadContent) {
                if (!loadContent[path].isLoad) {
                    allIsLoad = false;
                    break;
                }
            }

            if (allIsLoad && callbacks.onLoad) {

                callbacks.onLoad();
            }
        }

        function checkPercent() {
            if (callbacks.onProgress) {

                var total = 0, loaded = 0;
                for (var path in loadContent) {
                    total += loadContent[path].loadState.total;
                    loaded += loadContent[path].loadState.loaded;
                }

                var percentComplete = (loaded / total).toFixed(0);
                callbacks.onProgress(percentComplete);
            }
        }


        for (var i = 0; i < content.length; i++) {
            loadContent[content[i]] = {
                isLoad: false,
                isError: false,
                loadState: {
                    loaded: 0,
                    total: 0.1
                }
            };

            (function (path) {

                TIS.Util.importScript(
                    path,
                    function () {
                        loadContent[path].isLoad = true;
                        //loadContent[path].loadState.loaded = 100;
                        checkLoad();
                    },
                    function (e) {
                        loadContent[path].isError = true;
                        throw new URIError("The script " + e.target.src + " is not accessible.");
                    }, function (loaded, total) {
                        loadContent[path].loadState.loaded = loaded;
                        loadContent[path].loadState.total = total;
                        checkPercent();
                    });

            })(content[i]);

        }

    };

    TIS.Util.importScript = function (path, onLoad, onError, onProgress) {
        var head = document.head || document.getElementsByTagName("head")[0];

        var ext /*= path.split('.').pop()*/,
            element;
        ext = "js";

        if(path.indexOf(".css")>= 0) {
            ext = "css";
        }
        switch (ext) {
            case "js" :

                element = document.createElement("script");
                element.type = "text\/javascript";
                element.src = path;
                element.onload = function () {
                    if (onLoad) {
                        onLoad();
                    }
                };
                break;

            case "css" :

                element = document.createElement('link');
                element.type = 'text\/css';
                element.href = path;
                element.rel = 'stylesheet';
                element.media = 'all';
                break;

        }

        head.appendChild(element);

        if (ext == "css" && onLoad) {
            onLoad();
        }


    };

    TIS.Util.miladiToShamsi = function (year, month, day) {

        if (typeof year == "string") {
            year = parseInt(year);
        }

        if (typeof month == "string") {
            month = parseInt(month);
        }

        if (typeof day == "string") {
            day = parseInt(day);
        }
        return d2j(g2d(year, month, day));
    };

    TIS.Util.shamsiToMiladi = function (year, month, day) {
        if (typeof year == "string") {
            year = parseInt(year);
        }

        if (typeof month == "string") {
            month = parseInt(month);
        }

        if (typeof day == "string") {
            day = parseInt(day);
        }
        return d2g(j2d(year, month, day));
    };

    /**
     * @method convertToRange
     * @public
     *
     * @param {Number} value
     * @param {Array} srcRange
     * @param {Array} dstRange
     *
     * */
    TIS.Util.convertToRange = function (value, srcRange, dstRange) {
        // value is outside source range return
        if (value > 0) {
            if (value < srcRange[0] || value > srcRange[1]) {
                return NaN;
            }
        }


        var srcMax = srcRange[1] - srcRange[0],
            dstMax = dstRange[1] - dstRange[0],
            adjValue = value - srcRange[0];
        return (adjValue * dstMax / srcMax) + dstRange[0];

    };

    /**
     * @method isPointInCircle
     * @public
     *
     * @param {Object} pointPos
     *      @param {Number} pointPos.x
     *      @param {Number} pointPos.y
     * @param {Object} circlePos
     *      @param {Number} circlePos.x
     *      @param {Number} circlePos.y
     * @param {Number} circleRedius
     * @return {Boolean}
     *
     * */
    TIS.Util.isPointInCircle = function (pointPos, circlePos, circleRedius) {
        var D = Math.sqrt(Math.pow(circlePos.x - pointPos.x, 2) + Math.pow(circlePos.y - pointPos.y, 2));
        return D <= circleRedius
    };

    /**
     * @method isCircleInCircle
     * @public
     *
     * @param {Object} circle1Pos
     *      @param {Number} circle1Pos.x
     *      @param {Number} circle1Pos.y
     * @param {Number} circle1Radius
     * @param {Object} circle2Pos
     *      @param {Number} circle2Pos.x
     *      @param {Number} circle2Pos.y
     * @param {Number} circle2Radius
     * @return {Boolean}
     *
     * */
    TIS.Util.isCircleInCircle = function (circle1Pos, circle1Radius, circle2Pos, circle2Radius) {

        var D = Math.sqrt(Math.pow(circle1Pos.x - circle2Pos.x, 2) + Math.pow(circle1Pos.y - circle2Pos.y, 2));
        return D <= Math.abs(circle1Radius - circle2Radius);
    };

    /**
     * @method compareVersion
     * @public
     *
     * @param {String} newVersion
     * @param {String} oldVersion
     *
     * @return {Object} compareData
     *
     * */
    TIS.Util.compareVersion = function(newVersion,oldVersion) {
        var returnData = {
            isGreater: false,
            isEqual : false,
            majorConflict: false,
            isMajorGreater : false,
            minorConflict: false
        };

        var nRes = 0
            , newVersionSplit = newVersion.split('.')
            , oldVersionSplit = oldVersion.split('.')
            , nLen = Math.max(newVersionSplit.length, oldVersionSplit.length);

        for (var i = 0; i < nLen; i++) {
            var nP1 = (i < newVersionSplit.length) ? parseInt(newVersionSplit[i], 10) : 0
                , nP2 = (i < oldVersionSplit.length) ? parseInt(oldVersionSplit[i], 10) : 0;

            if (isNaN(nP1)) { nP1 = 0; }
            if (isNaN(nP2)) { nP2 = 0; }

            if (nP1 != nP2) {
                nRes = (nP1 > nP2) ? 1 : -1;
                break;
            }
        }

        if(parseInt(newVersionSplit[0]) != parseInt(oldVersionSplit[0])) {
            returnData.majorConflict = true;
        }
        if(parseInt(newVersionSplit[0]) > parseInt(oldVersionSplit[0])) {
            returnData.isMajorGreater = true;
        }

        if(parseInt(newVersionSplit[1]) != parseInt(oldVersionSplit[1])) {
            returnData.minorConflict = true;
        }

        if(nRes == 0) {
            returnData.isEqual = true;
        } else if(nRes == 1){
            returnData.isGreater = true;
        }



        return returnData;
    };

    TIS.Util.hasPermission = function (permission, callback) {
        var hasDiagnostic = typeof window.cordova != "undefined" ? window.cordova.plugins && window.cordova.plugins.diagnostic : false;
        var retDat = {
            state: true,
            type: ""
        };

        if (hasDiagnostic) {
            window.cordova.plugins.diagnostic.getPermissionAuthorizationStatus(function (status) {
                retDat.type = status;
                switch (status) {
                    case window.cordova.plugins.diagnostic.permissionStatus.GRANTED:
                        callback && callback(retDat);
                        // console.log("Permission granted to use the camera");
                        break;
                    case window.cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                        // console.log("Permission to use the camera has not been requested yet");
                        retDat.state = false;
                        callback && callback(retDat);
                        break;
                    case window.cordova.plugins.diagnostic.permissionStatus.DENIED:
                        // console.log("Permission denied to use the camera - ask again?");
                        retDat.state = false;
                        callback && callback(retDat);
                        break;
                    case window.cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                        // console.log("Permission permanently denied to use the camera - guess we won't be using it then!");
                        retDat.state = false;
                        callback && callback(retDat);
                        break;
                }
            }, function (error) {
                console.error("The following error occurred: " + error);
            }, permission);
        } else {
            callback && callback(retDat);
        }

    };

    TIS.Util.requestPermission = function (permission, callback) {

        var hasDiagnostic = typeof window.cordova != "undefined" ? window.cordova.plugins && window.cordova.plugins.diagnostic : false;
        var retDat = {
            state: true,
            type: ""
        };

        if (hasDiagnostic) {
            window.cordova.plugins.diagnostic.requestRuntimePermission(function (status) {
                switch (status) {
                    case window.cordova.plugins.diagnostic.permissionStatus.GRANTED:
                        // console.log("Permission granted to use the camera");
                        callback && callback(retDat);
                        break;
                    case window.cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                        // console.log("Permission to use the camera has not been requested yet");
                        retDat.state = false;
                        callback && callback(retDat);
                        break;
                    case window.cordova.plugins.diagnostic.permissionStatus.DENIED:
                        // console.log("Permission denied to use the camera - ask again?");
                        retDat.state = false;
                        callback && callback(retDat);
                        break;
                    case window.cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                        // console.log("Permission permanently denied to use the camera - guess we won't be using it then!");
                        retDat.state = false;
                        callback && callback(retDat);
                        break;
                }
            }, function (error) {
                console.error("The following error occurred: " + error);
                retDat.state = false;
                callback && callback(retDat);
            }, permission);
        } else {
            callback && callback(retDat);
        }

    };

    TIS.Util.distance = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

    };

    TIS.Util.generateImageSrc = function (params) {
        var imgId = params.imgId,
            hashCode,
            size = params.size,
            imageServerAddress = params.imageServerAddress;

        if(typeof params.imgData == "object") {
            imgId = params.imgData.id;
            hashCode =  params.imgData.hashCode;
        } else {
            imgId = params.imgId
        }
        var src = "?imageId=" + imgId;


        if (size && size.width)
            src = src + "&width=" + size.width;

        if (size && size.height)
            src = src + "&height=" + size.height;
        
        if(hashCode) {
            src = src + "&hashCode=" + hashCode;
        }
        return imageServerAddress + "/nzh/image/" + src;
    };

    TIS.Util.generateImageUrl = TIS.Util.generateImageSrc;

    TIS.Util.hasMajorConflict = function (params) {
        var currentVersion = params.currentVersion;
        var lastVersion = params.lastVersion;


        if (currentVersion && lastVersion) {
            return !(currentVersion.split(".")[0] == lastVersion.split(".")[0]);
        } else {
            console.log("ALL DATA IS NOT SET ", currentVersion, lastVersion);
            return false;
        }
    };

    TIS.Util.openUrl = function (url,openLocation,option) {
        if(!openLocation) {
            openLocation = "_system";
        }
        if(TIS.Util.isApp()) {
            if(window.cordova) {
                if(window.cordova.plugins && window.cordova.plugins.browsertab ) {
                    window.cordova.plugins.browsertab.isAvailable(function(result) {
                            if (!result) {
                                window.cordova.InAppBrowser.open(url, openLocation,option);
                            } else {
                                window.cordova.plugins.browsertab.openUrl(
                                    url,
                                    function(successResp) {},
                                    function(failureResp) {
                                        window.cordova.InAppBrowser.open(url, openLocation);
                                    });
                            }
                        },
                        function(isAvailableError) {
                            window.cordova.InAppBrowser.open(url, openLocation,option);
                        });
                } else if(window.cordova.InAppBrowser) {
                    window.cordova.InAppBrowser.open(url, openLocation,option);
                } else {
                    TIS.Plugin.startActivity({
                            action: TIS.Plugin.ACTION_VIEW,
                            url: url
                        },
                        function () {
                            //__log('success to open URL via Android Intent');
                        },
                        function () {
                            //__log('Failed to open URL via Android Intent');
                        }
                    );
                }
            } else {
                window.open(url);
            }

        } else {
            window.open(url);
        }
        return true;
    };
    
    TIS.Util.createReturnData = function (hasError,errorMessage,errorCode,result) {
        return {
            hasError : hasError,
            errorMessage : typeof errorMessage == "string" ? errorMessage : "",
            errorCode : typeof errorCode == "number" ? errorCode : 0,
            result : result
        };
    };

    TIS.Util.parseResponseHeaders = function parseResponseHeaders(headerStr) {
        var headers = {};
        if (!headerStr) {
            return headers;
        }
        var headerPairs = headerStr.split('\u000d\u000a');
        for (var i = 0; i < headerPairs.length; i++) {
            var headerPair = headerPairs[i];
            // Can't use split() here because it does the wrong thing
            // if the header value has the string ": " in it.
            var index = headerPair.indexOf('\u003a\u0020');
            if (index > 0) {
                var key = headerPair.substring(0, index);
                var val = headerPair.substring(index + 2);
                headers[key] = val;
            }
        }
        return headers;
    };

    TIS.Util.urlify = function (text) {
        var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
        //var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function (url, b, c) {
            var url2 = (c == 'www.') ? 'http://' + url : url;
            return "<a  target='_blank' value=" + url2 + " style='cursor:pointer' class='TIS-url'>" + url + "</a>";
        });
    };

    TIS.Util.isNodeJS = function () {
        return (typeof module !== 'undefined' && typeof module.exports != "undefined");
    };

    TIS.Util.startWith = function (str,withStr) {
        return str.indexOf(withStr) === 0;
    };

    TIS.Util.getStackTrace = function () {
        try  {
            var obj = {};
            Error.captureStackTrace(obj, TIS.Util.getStackTrace);
            return obj.stack;
        }catch (e){
            return e.message;
        }
    };
    
    TIS.Util.getBrowserData = function() {

        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName  = navigator.appName;
        var fullVersion  = ''+parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion,10);
        var nameOffset,verOffset,ix;

// In Opera 15+, the true version is after "OPR/"
        if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset+4);
        }
// In older Opera, the true version is after "Opera" or after "Version"
        else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset+6);
            if ((verOffset=nAgt.indexOf("Version"))!=-1)
                fullVersion = nAgt.substring(verOffset+8);
        }
// In MSIE, the true version is after "MSIE" in userAgent
        else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
            browserName = "Microsoft Internet Explorer";
            fullVersion = nAgt.substring(verOffset+5);
        }
// In Chrome, the true version is after "Chrome"
        else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
            browserName = "Chrome";
            fullVersion = nAgt.substring(verOffset+7);
        }
// In Safari, the true version is after "Safari" or after "Version"
        else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
            browserName = "Safari";
            fullVersion = nAgt.substring(verOffset+7);
            if ((verOffset=nAgt.indexOf("Version"))!=-1)
                fullVersion = nAgt.substring(verOffset+8);
        }
// In Firefox, the true version is after "Firefox"
        else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
            browserName = "Firefox";
            fullVersion = nAgt.substring(verOffset+8);
        }
// In most other browsers, "name/version" is at the end of userAgent
        else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <
            (verOffset=nAgt.lastIndexOf('/')) )
        {
            browserName = nAgt.substring(nameOffset,verOffset);
            fullVersion = nAgt.substring(verOffset+1);
            if (browserName.toLowerCase()==browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }
// trim the fullVersion string at semicolon/space if present
        if ((ix=fullVersion.indexOf(";"))!=-1)
            fullVersion=fullVersion.substring(0,ix);
        if ((ix=fullVersion.indexOf(" "))!=-1)
            fullVersion=fullVersion.substring(0,ix);

        majorVersion = parseInt(''+fullVersion,10);
        if (isNaN(majorVersion)) {
            fullVersion  = ''+parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion,10);
        }

        var platformData = navigator.platform.split(" ");
        return {
            name : browserName,
            fullVersion : fullVersion,
            majorVersion : majorVersion,
            appName : navigator.appName,
            userAgent : navigator.userAgent,
            platform : platformData[0],
            architecture : platformData[1]
        }
    };

    TIS._Util.objValueSize = function (obj, returnData) {
        if (typeof obj !== "string" && obj.length) {
            for (var i = 0; i < obj.length; i += 1) {
                TIS._Util.objValueSize(obj[i], returnData)
            }

        } else if (typeof obj === "object") {
            for (var item in obj) {
                TIS._Util.objValueSize(obj[item], returnData)
            }

        } else {
            returnData.push("");
        }
    };

    TIS._Util.traverseObj = function (currentObject, path, finalData) {
        if (typeof currentObject !== "string" && currentObject.length) {
            for (var i = 0; i < currentObject.length; i += 1) {
                TIS._Util.traverseObj(currentObject[i], path.concat(i), finalData);
            }
        } else if (typeof currentObject === "object") {
            if (currentObject.src && typeof currentObject.src == "string") {
                var data = {
                    value: currentObject,
                    path: path
                };
                finalData.push(data);
            } else {
                for (var item in currentObject) {
                    TIS._Util.traverseObj(currentObject[item], path.concat(item), finalData);
                }
            }

        } else {
            var data = {
                value: currentObject,
                path: path
            };
            finalData.push(data);
        }
    };


    TIS.Util.tokenizeCurrency = function (value) {
        value = value.toString();
        var result = "";
        var rial = value;
        if (value.contains(".")) {
            rial = rial.substring(0, rial.indexOf("."));
        }
        if (rial.toString().length > 3) {
            var customizeCurrency = "";
            var temp = rial.toString().replace(",", "");
            var len = temp.toString().length;
            var counter = 0;
            for (var i = len; i > 0; i--) {
                counter += 1;
                if (counter == 3 && i != 1) {
                    customizeCurrency += temp[i - 1] + ",";
                    counter = 0;
                } else {
                    customizeCurrency += temp[i - 1];
                }
            }
            result = customizeCurrency.split("").reverse().join("");
        } else {
            result = rial;
        }
        if (value.contains(".")) {
            var temp = value.substring(value.indexOf("."), value.length);
            if (temp.length > 3) temp = temp.substring(0, 4);
            result = result + temp;
        }
        return result;
    };

    TIS._Util.htmlEntities = function (str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    var isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };


    if (typeof exports !== 'undefined' && module.exports) {
        module.exports = TIS.Util;
    }
})();
