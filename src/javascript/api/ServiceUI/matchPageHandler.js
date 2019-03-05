/**transform
 * @class MatchPageHandler
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.MatchPageHandler = function(params) {

    /**
     * @method getContainer
     * @public
     *
     * @return {object} jquery object
     *
     * */
    this.getContainer = function() {};

    /**
     * @method setTabState
     * @public
     *
     * @return {Boolean} state
     *
     * */
    this.setTabState = function(state) {};

    /**
     * @method close
     * @public
     *
     *
     * */
    this.close = function() {};

    /**
     * @method show
     * @public
     *
     *
     * */
    this.show = function() {};

    /**
     * @method selectChat
     * @public
     *
     * */
    this.selectChat = function() {};

    /**
     * @event onShow
     * @public
     *
     *
     * */
    this.onShow = function() {};

    /**
     * @event onHide
     * @public
     *
     *
     * */
    this.onHide = function() {};

    /**
     * @event onClose
     * @public
     *
     * @param {Function} callback  call function with true or false value ;true value close the page
     *          if not override this function default , the callback call with true value
     *
     * @param {Boolean} callback.state
     *
     * */
    this.onClose = function(callback) {
        callback(true);
    };
};