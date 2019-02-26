/**
 * Description
 * @class MultiPlayerGame
 * @constructor
 * @module Service
 *
 * @param {Object} params
 *      @param {Boolean} params.isMultiPlayer
 *      @param {Number} params.matchId
 *      @param {Number} params.leagueId
 *      @param {Object} [params.stateData]
 *      @param {Object} [params.config]
 *      @param {Object} [params.userData]
 *      @param {Object} params.ui
 *      @param {Boolean} params.isQuick
 *      @param {Boolean} params.isReload
 *      @param {Object} params.players
 *              @param {Object} params.players.662player1
 *                  @param {Number} params.players.player1.id
 *                  @param {String} params.players.player1.name
 *                  @param {Boolean} params.players.player1.applicant
 *                  @param {Object} params.players.player1.rank
 *              @param {Object} params.players.player2
 *                  @param {Number} params.players.player2.id
 *                  @param {String} params.players.player2.name
 *                  @param {Boolean} params.players.player2.applicant
 *                  @param {Object} params.players.player2.rank
 * */
TIS.MultiPlayerGame = function(params) {
};

/**
 * @method sendData
 * @public
 *
 * @param {Object} params
 * @param {Object} params.sendData
 * @param {Object} params.stateData
 * @param {Boolean} [params.sequential=false]
 * @param {String} [params.dataId]
 * @param {Function} params.onResult
 *      @param {Boolean} params.onResult.hasError
 *      @param {String} params.onResult.errorMessage
 *      @param {Object} params.onResult.result
 *              @param {Boolean} params.onResult.result.state
 *              @param {String} params.onResult.result.dataId
 *
 * @return {dataId : String}
 * */
TIS.MultiPlayerGame.prototype.sendData = function(params){};

/**
 * @method saveStateData
 * @public
 *
 * @param {Object} params
 * @param {Object} params.stateData
 * @param {Boolean} params.upgradeLevel
 *
 * @param {String} [params.dataId]
 *
 * @param {Function} callback
 *      @param {Boolean} callback.hasError
 *      @param {String} callback.errorMessage
 *      @param {Object} callback.result
 *          @param {Object} callback.dataId
 *
 * */
TIS.MultiPlayerGame.prototype.saveStateData = function(params,callback){};

/**
 * @method saveStaticData
 * @public
 *
 * @param {Object} params
 * @param {Object} params.staticData
 *
 * @param {Function} params.onResult
 *      @param {Boolean} params.onResult.hasError
 *      @param {String} params.onResult.errorMessage
 *
 * */
TIS.MultiPlayerGame.prototype.saveStaticData = function(params){};

/**
 * @method sendResult
 * @public
 *
 * @param {Object} result
 * */
TIS.MultiPlayerGame.prototype.sendResult = function(result){};

/**
 * @method sendResult
 * @public
 *
 * @param {Object} score
 * */
TIS.MultiPlayerGame.prototype.sendScore = function(score){};

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
TIS.MultiPlayerGame.prototype.getTopScore = function(params,callback){};

/**
 * @method getSequentialDataQueue
 * @public
 *
 * @param {Object} params
 *      @param {Function} params.onResult
 *              @param {Boolean} params.onResult.hasError
 *              @param {String} params.onResult.errorMessage
 *              @param {Object} params.onResult.result
 *                      @param {Array} params.onResult.result.ids
 * */
TIS.MultiPlayerGame.prototype.getSequentialDataQueue = function(params){};

/**
 * @method ready
 * @public
 *
 * @param {Object} params
 *      @param {Function} params.onResult
 *              @param {Boolean} params.onResult.hasError
 *              @param {String} params.onResult.errorMessage
 * */
TIS.MultiPlayerGame.prototype.ready = function(params){};

/**
 * @method reMatch
 * @public
 *
 * @param {Object} params
 *      @param {Function} params.onResult
 *              @param {Boolean} params.onResult.hasError
 *              @param {String} params.onResult.errorMessage
 *              @param {Function} params.onResult.cancel
 *
 *      @param {Function} [params.onCancel] for online request
 *          @param {Function} params.onCancel.requestId
 *
 *      @param {Function} [params.onAccept] for online request
 *          @param {Function} params.onAccept.requestId
 *
 *      @param {Function} [params.onReject] for online request
 *          @param {String} params.onReject.requestId
 *          @param {String} params.onReject.rejectMessage
 *
 * @return {cancel : Function}
 * */
TIS.MultiPlayerGame.prototype.reMatch = function(params){};

/**
 * @method cancel
 * @public
 * */
TIS.MultiPlayerGame.prototype.cancel = function(){};

/**
 * @event onInit
 * @public
 * */
TIS.MultiPlayerGame.prototype.onInit = function(){};

/**
 * @event onStart
 * @public
 * */
TIS.MultiPlayerGame.prototype.onStart = function(){};

/**
 * @event onPause
 * @public
 * */
TIS.MultiPlayerGame.prototype.onPause = function(){};

/**
 * @event onResume
 * @public
 * */
TIS.MultiPlayerGame.prototype.onResume = function(){};

/**
 * @event onLeave
 * @public
 *
 * @param {Object} params
 *      @param {Number} params.opponentId
 * */
TIS.MultiPlayerGame.prototype.onLeave = function(params){};

/**
 * @event onEnd
 * @public
 *
 * @param {Object} state
 * */
TIS.MultiPlayerGame.prototype.onEnd = function(state){};

/**
 * @event onSentData
 * @public
 *
 * @param {Object} params
 *      @param {String} params.dataId
 *      @param {Boolean} params.sequential
 *      @param {Number} params.sequentialDataQueueLength
 * */
TIS.MultiPlayerGame.prototype.onSentData = function(params){};

/**
 * @event onReceiveDataAck
 * @public
 *
 * @param {Object} params
 *      @param {String} params.dataId
 *      @param {Boolean} params.sequential
 * */
TIS.MultiPlayerGame.prototype.onReceiveDataAck = function(params){};

/**
 * @event onReceiveData
 * @public
 *
 * @param {Object} params
 *      @param {Object} params.data
 *      @param {String} params.dataId
 * */
TIS.MultiPlayerGame.prototype.onReceiveData = function(params){};