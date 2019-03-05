+function ($) {
    var Slide = function (element, options) {

        var __self = this,
            __container = element,
            __breadcrumbsContainerElm, __nextElm, __prevElm,
            __pageNumberElm,
            __isTouch = TIS.Util.isTouchable(),
            __isSliding = false,
        //__hasWindowResize = false,
            __events = {
                change: {}
            },
            __slideQueue = [],
            __slides = {
                list: {
                    /*
                     * slideNumber : {
                     *   element :
                     *   leftId :
                     *   rightId :
                     * }
                     *
                     * */
                },
                firsId: undefined,
                lastId: undefined,
                currentId: undefined,
                length: 0
            },

            __autoSlide = true;


        var __init = function () {
                if (options) {

                    if(typeof options.autoSlide == "boolean") {
                        __autoSlide = false;
                    }
                }
                __initController();

                if (__isTouch) {
                    __initTouchEvent();
                }

                //__initEvent();
            },

            __showController = function () {
                __nextElm.css("visibility", "visible");
                __prevElm.css("visibility", "visible");
                __pageNumberElm.css("visibility", "visible");
            },

            __initEvent = function () {
                //$(window).on("resize",function() {
                //    __hasWindowResize = true;
                //})
            },

            __hideController = function () {
                __nextElm.css("visibility", "hidden");
                __prevElm.css("visibility", "hidden");
                __pageNumberElm.css("visibility", "hidden");
            },

            __changePageNumber = function () {
                var pageNumber = Object.keys(__slides.list).indexOf(__slides.currentId) + 1;
                __pageNumberElm.html(pageNumber + "/" + __slides.length);
            },

            __initController = function () {

                var prevContent = "\
                    <span style='position: absolute;height:100%;left:0;display:table;cursor: pointer;visibility: hidden;z-index: 3'>\
                        <i class='tis tis-3x tis-left-open-big ' style='color:#bfbfbf;padding-left:10px;display: table-cell;vertical-align: middle'></i>\
                    </span>\
                    ";

                var nextContent = "\
                    <span style='position: absolute;height:100%;right:0;display:table;cursor: pointer;visibility: hidden;z-index: 3'>\
                        <i class='tis tis-3x  tis-right-open-big  ' style='color:#bfbfbf;padding-right:10px;display: table-cell;vertical-align: middle'></i>\
                    </span>\
                    ";
                //var breadcrumbs = "<div style='position: absolute;right: 0;bottom: 10px;z-index: 3'></div>";
                var pageNumberElm = "<div class='TIS-indicator' style='font-size: 1.5em;position: absolute;right: 10px;bottom: 10px;z-index: 3;visibility: hidden;'></div>";

                __nextElm = $(nextContent)
                    .appendTo(__container)
                    .on("click", function () {
                        __self.prev();
                    });

                __prevElm = $(prevContent)
                    .appendTo(__container)
                    .on("click", function () {
                        __self.next();
                    });

                //__breadcrumbsContainerElm = $(breadcrumbs).appendTo(__container);
                __pageNumberElm = $(pageNumberElm).appendTo(__container);

            },

            __initTouchEvent = function () {

                var startTime,
                    startXPos;

                __container.on("touchstart", function (e) {

                    if (!__isSliding) {
                        //startTime = new Date();
                        startXPos = e.originalEvent.touches[0].clientX;
                    }
                    //console.log("touchstart",startXPos);
                });

                __container.on("touchend touchcancel", function (e) {
                    //console.log("touchend",e.type);
                    //console.log("touchend",__slides.length,__isSliding);
                    if (__slides.length > 1 && !__isSliding) {
                        //var difTime = new Date() - startTime;
                        //console.log("000000",difTime);
                        //if(difTime > 30) {
                        var dif = e.originalEvent.changedTouches[0].clientX - startXPos;
                        //console.log("11111111",Math.abs(dif),($(window).width()/15));
                        if (Math.abs(dif) > ($(window).width() / 15)) {
                            if (dif > 0) {
                                __self.prev();
                            } else {

                                __self.next();
                            }
                        }
                        //}
                    }
                });

                //__container.on("touchmove",function(e) {
                //    console.log("touchmove");
                //    //e.stopPropagation();
                //    e.preventDefault();
                //});
            },

            __slide = function (params) {
                //console.log("SLIDE--00",__isSliding,__slides.currentId ,params.slideNumber);
                if (__isSliding) {
                    __slideQueue.push(params);
                    return;
                }
                var slideNumber = params.slideNumber,
                    callback = params.callback,
                    direction = params.direction || "next";

                if (__slides.currentId != slideNumber) {
                    __isSliding = true;
                    var currentId = __slides.currentId;

                    __slides.nextId = slideNumber;
                    //console.log("SLIDEE",currentId,slideNumber);
                    var currentSlide = __slides.list[currentId],
                        nextSlide = __slides.list[slideNumber],
                        currentWidth = $(window).width();


                    nextSlide && nextSlide.element.show();
                    currentSlide && currentSlide.element.show();

                    var start, end;

                    if (direction == "next") {
                        start = {value: 0};
                        end = {value: currentWidth};
                    } else {
                        start = {value: 0};
                        end = {value: -currentWidth};
                        currentWidth = -currentWidth;
                    }


                    $(start).animate(end, {
                        duration: 1000,
                        step: function (current) {
                            //if(!currentSlide) {
                            //    console.log("step",currentId,slideNumber);
                            //}
                            currentSlide.element.css("transform", "translateX(" + current + "px)");
                            nextSlide.element.css("transform", "translateX(" + (current - currentWidth) + "px)");
                        },
                        complete: function () {
                            //console.log("complete",currentId, slideNumber);
                            //currentSlide.breadcrumbElm.css("background-color","");
                            //nextSlide.breadcrumbElm.css("background-color","white");
                            __slides.currentId = slideNumber;
                            __slides.nextId = undefined;
                            __isSliding = false;
                            currentSlide.element.hide();

                            __changePageNumber();

                            if (__slideQueue.length > 0) {
                                setTimeout(function () {
                                    var data = __slideQueue.splice(0, 1);
                                    //console.log("Next ",data[0]);
                                    if (data.length > 0) {
                                        __slide(data[0]);
                                    }
                                }, 1000);
                                //console.log("SLIDE--22",__slideQueue);
                            }
                            callback && callback();
                            for (var eventId in __events.change) {
                                __events.change[eventId]({
                                    in: {
                                        slideNumber: slideNumber
                                    },
                                    out: {
                                        slideNumber: currentId
                                    }
                                });
                            }


                        }
                    });

                }
            };


        this.add = function (content) {

            var currentElm = $(content);


            if (currentElm.length > 0) {
                currentElm.css({
                    height: "100%",
                    width: "100%",
                    top: "0px",
                    bottom: "0px",
                    position: "absolute"
                });
                __container.append(currentElm);
                var slideNumber = TIS.Util.generateUUID();
                currentElm.attr("slideNumber", slideNumber);

                currentElm.hide();
                __slides.length += 1;

                if (__slides.firsId != undefined) {

                    var lastId = __slides.lastId;

                    __slides.list[lastId].rightId = slideNumber;

                    __slides.list[slideNumber] = {
                        element: currentElm,
                        //breadcrumbElm : breadcrumbElm,
                        leftId: lastId
                    };

                    __slides.lastId = slideNumber;

                    if(__autoSlide) {
                        __slide({
                            slideNumber: slideNumber
                        });
                    }

                } else {
                    __slides.list[slideNumber] = {
                        element: currentElm
                        //breadcrumbElm : breadcrumbElm
                    };
                    __slides.firsId = __slides.lastId = __slides.currentId = slideNumber;
                    currentElm.show();
                    //breadcrumbElm.css("background-color", "white");
                }

                __changePageNumber();

                if (__slides.length == 2) {
                    __showController();
                }

                return slideNumber;

            }

            return false;
        };

        this.remove = function (slideNumber) {
            //console.log("REMOVE--00",slideNumber);
            var slide = __slides.list[slideNumber];

            if (slide) {
                var leftId = slide.leftId,
                    rightId = slide.rightId,
                    direction, nextId;

                if (rightId != undefined) {
                    nextId = rightId;
                    direction = "next";
                } else if (leftId != undefined) {
                    nextId = leftId;
                    direction = "prev";
                }


                var endAct = function (ss) {
                    //console.log("REMOVE--22",slideNumber,leftId,rightId);

                    for (var i = 0; i < __slideQueue.length; i++) {
                        var data = __slideQueue[i];

                        if (slideNumber == data.slideNumber) {
                            //console.log("cccccccccccccccccc",slideNumber);
                            __slideQueue.splice(i, 1);
                        }

                    }
                    if (leftId && __slides.list[leftId]) {
                        if (rightId) {
                            __slides.list[leftId].rightId = rightId;
                            __slides.list[rightId].leftId = leftId;
                        } else {
                            __slides.list[leftId].rightId = undefined;
                            __slides.lastId = leftId;
                        }
                    } else if (rightId && __slides.list[rightId]) {
                        __slides.list[rightId].leftId = undefined;
                        __slides.firsId = rightId;

                    } else {
                        __slides.firsId = __slides.lastId = __slides.currentId = undefined;
                    }

                    delete __slides.list[slideNumber];
                    slide.element.remove();
                    //slide.breadcrumbElm.remove();
                    __slides.length -= 1;

                    __changePageNumber();

                    if (__slides.length == 1) {
                        __hideController();
                    }
                };
                //console.log("REMOVE--11",slideNumber,__slides.currentId,nextId);
                if (nextId && (slideNumber == __slides.currentId || slideNumber == __slides.nextId)) {
                    __slide({
                        slideNumber: nextId,
                        direction: direction,
                        callback: function () {
                            endAct(true);
                        }
                    })
                } else {
                    endAct(false);
                }

            }
        };

        this.removeAll = function () {
            __container.find("div[slideNumber]").remove();
            //__breadcrumbsContainerElm.empty();
            __pageNumberElm.empty();

            __isSliding = false;
            __slideQueue = [];
            __slides = {
                list: {},
                firsId: undefined,
                lastId: undefined,
                currentId: undefined,
                length: 0
            }
        };

        this.next = function () {
            //console.log("next",__isSliding);
            if (__isSliding) {
                return;
            }
            var currentId = __slides.currentId,
                nextId;

            if (currentId == __slides.lastId) {
                nextId = __slides.firsId;
            } else {
                nextId = __slides.list[currentId].rightId;
            }

            __slide({
                slideNumber: nextId,
                direction: "prev",
                callback: function () {

                }
            });
        };

        this.prev = function () {
            //console.log("prev",__isSliding);
            if (__isSliding) {
                return;
            }
            var currentId = __slides.currentId,
                prevId;

            if (currentId == __slides.firsId) {
                prevId = __slides.lastId;
            } else {
                prevId = __slides.list[currentId].leftId;
            }
            __slide({
                slideNumber: prevId,
                direction: "next"
            });
        };

        this.slide = function (slideNumber) {
            __slide({
                slideNumber: slideNumber
            });
        };

        this.on = function (eventName, callback) {
            if (__events[eventName]) {
                var id = TIS.Util.generateUUID();
                __events[eventName][id] = callback;

                return id;
            }
        };



        __init();
    };

    // COLLAPSE PLUGIN DEFINITION
    // ==========================


    $.fn.tisSlide = function (option) {
        $(this).css({
            position: "absolute",
            width: "100%",
            height: "100%"
        });
        return new Slide(this, option);
    };

    //$.fn.tisSlide.Constructor = Slide;


}(jQuery);

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        //module.exports = factory(require('../moment')); // Node
    } else {
        factory((typeof global !== 'undefined' ? global : this).moment); // node or other global
    }
}(function (moment) {
    var symbolMap = {
        '1': '۱',
        '2': '۲',
        '3': '۳',
        '4': '۴',
        '5': '۵',
        '6': '۶',
        '7': '۷',
        '8': '۸',
        '9': '۹',
        '0': '۰'
    }, numberMap = {
        '۱': '1',
        '۲': '2',
        '۳': '3',
        '۴': '4',
        '۵': '5',
        '۶': '6',
        '۷': '7',
        '۸': '8',
        '۹': '9',
        '۰': '0'
    };

    return moment.defineLocale('fa', {
        months: 'فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند'.split('_'),
        monthsShort: 'فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند'.split('_'),
        weekdays: 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
        weekdaysShort: 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
        weekdaysMin: 'ی_د_س_چ_پ_ج_ش'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'LT:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 12) {
                return 'قبل از ظهر';
            } else {
                return 'بعد از ظهر';
            }
        },
        calendar: {
            sameDay: '[امروز ساعت] LT',
            nextDay: '[فردا ساعت] LT',
            nextWeek: 'dddd [ساعت] LT',
            lastDay: '[دیروز ساعت] LT',
            lastWeek: 'dddd [پیش] [ساعت] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s بعد ',
            past: '%s پیش',
            s: 'چندین ثانیه',
            m: 'یک دقیقه',
            mm: '%d دقیقه',
            h: 'یک ساعت',
            hh: '%d ساعت',
            d: 'یک روز',
            dd: '%d روز',
            M: 'یک ماه',
            MM: '%d ماه',
            y: 'یک سال',
            yy: '%d سال'
        },
        preparse: function (string) {
            string.replace(/[۰-۹]/g, function (match) {
                return numberMap[match];
            }).replace(/،/g, ',');

            return string;
        },
        postformat: function (string) {
            string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '،');

            return string;
        },
        ordinalParse: /\d{1,2}م/,
        ordinal: '%dم',
        week: {
            dow: 6, // Saturday is the first day of the week.
            doy: 12 // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
