/**
 * @class AdUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.AdUI = function (options) {

    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __lang = options.language,
        __$container,
        __visibility = false,
        __isApp = TIS.Util.isApp();

    var __init = function () {
            __initView();
            __initEvent();

            if(!__isApp) {
                $('#TIS_ad_sendSmsContainer').hide();
                $('#TIS_ad_shareSocialContainer').hide();
            }
        },

        __initView = function () {
            var registerElm = "\
            <div  id='TIS_ad_container'>\
                        <div class='panel panel-info' style='height: 100%'>\
                            <div class='panel-body'  style='height: 100%;padding: 0;d' >\
                                <div id='TIS_ad_close' class='TIS-border-orangeColor' \
                                style='position: absolute;left: 0;top: 0;margin: 10px;width: 4em;height: 4em;border-width: 5px ;border-style: solid;border-radius: 50%;display:table;text-align: center'>\
                                    <span class='tis tis-close-circle tis-2x TIS-orangeColor TIS-pointer'  style='display:table-cell;vertical-align: middle'></span>\
                                </div>\
                            </div>\
                            <div class='modal-footer'>\
                            </div>\
                        </div>\
            </div>";

            __$container = $(registerElm);

            __$container.appendTo(document.body).modal("hide");
        },

        __initEvent = function () {
            $("#TIS_ad_close").on("click", function () {
                __self.hide();
            });

            //document.addEventListener("backbutton", function (e) {
            //    if(__visibility) {
            //        __self.hide();
            //    }
            //    e.stopPropagation();
            //    e.preventDefault();
            //    return false;
            //}, true);
        },

        __visibilityFN = function(visibility) {

            if(typeof visibility == "boolean") {
                if(visibility) {
                    __self.show();
                } else {
                    __self.hide();
                }
            }
            return __visibility;
        };

    /*==================================================================================================================
     *                                 P R O T E C T E D     M E T H O D
     *================================================================================================================*/

    /**
     * @method show
     * @public
     * @chainable
     *
     * */
    __self.show = function (params) {
        if(params && params.src) {
            var userData = params.userData;
            __visibility = true;
            var link = params.src;
            if(userData && userData.id) {
                link += ("/?userId=" + userData.id + "&nickName=" + userData.name);
            }
            if(userData.coordsData) {
                link += ("&latitude=" + userData.coordsData.latitude + "&longitude=" +  userData.coordsData.longitude );
            }

            // var content = "\
            //         <iframe style='width: 100%;height: 100%' src='"+link+"' ></iframe>\
            //     ";
            // __$container.find(".panel-body").append(content);
            //
            // $("#TIS_ad_container").show();
            TIS.Util.openUrl(link);
        } else {
            __visibility = false;
        }


        return __self;
    };

    /**
     * @method hide
     * @public
     * @chainable
     *
     *
     *
     * */
    __self.hide = function () {
        __visibility = false;
        $("#TIS_ad_container").hide();
        __$container.find("iframe").remove();

        return __self;
    };

    /**
     * @method visibility
     * @public
     *
     * @param  {Boolean} visibility
     * @return {Boolean} visibility
     * */
    __self.visibility = __visibilityFN;

    /**
     * @method toggle
     * @public
     * @chainable
     *
     * */
    __self.toggle = function() {

        if(__visibility) {
            __self.hide();
        } else {
            __self.show();
        }
        return __self;
    };

    __self.backButton = function () {
        if (__visibility) {
            __self.hide();
            return true;
        }
        return false;
    };
    

    __init();
};

