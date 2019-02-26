/**
 * Description
 * @class SinglePlayerGame
 * @constructor
 * @module Service
 *
 * @param {Object} params
 *      @param {Boolean} params.isMultiPlayer
 *      @param {Number} params.matchId
 *      @param {Number} params.leagueId
 *      @param {Object} [params.config]
 *      @param {Object} [params.stateData]
 *      @param {Object} [params.userData]
 *      @param {Object} params.ui
 *      @param {Object} params.players
 *              @param {Object} params.players.player1
 *                  @param {Number} params.players.player1.id
 *                  @param {String} params.players.player1.name
 *                  @param {Boolean} params.players.player1.applicant
 * */
TIS.SinglePlayerGame = function(params) {
};

/**
 * @method sendResult
 * @public
 *
 * @param {Object} result
 * */
TIS.SinglePlayerGame.prototype.sendResult = function(result){};

/**
 * @method sendResult
 * @public
 *
 * @param {Object} score
 * */
TIS.SinglePlayerGame.prototype.sendScore = function(score){};

/**
 * @method getTopScore
 * @public
 *
 * @param {Object} params
 *      @param {Boolean} params.currentLeague
 *      @param {Boolean} params.isGlobal
 * @param {Function} callback
 *      @param {Boolean} callback.hasError
 *      @param {String} callback.errorMessage
 *      @param {Object} callback.result
 * */
TIS.SinglePlayerGame.prototype.getTopScore = function(params,callback){};

/**
 * @event onInit
 * @public
 * */
TIS.SinglePlayerGame.prototype.onInit = function(){};
