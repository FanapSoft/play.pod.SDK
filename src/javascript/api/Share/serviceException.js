(function () {
    function ServiceException(message,originalException) {
        this.message = message;
        this.originalException = originalException;
        var fnName;
        var stackTrace;

        if ('undefined' !== typeof Error && ((Error).captureStackTrace)) {
            var getStackTrace = function debugReportAssertGetStackTraceFn() {
                var obj = {};
                (Error).captureStackTrace(obj, getStackTrace);
                stackTrace = (obj).stack;

                // Attempt to get the name of the function in which
                // debug.assert was called.
                var fnFrame = stackTrace.split("\n")[3];
                fnName = fnFrame.substr(fnFrame.indexOf("at ") + 3);
            };
            getStackTrace();
        }

        if (fnName) {
            message = "ASSERT at " + fnName + ": " + message;
        } else {
            message = "ASSERT: " + message;
        }



        if(originalException) {
            console.error(originalException.stack);
        } else {
            console.log(message);
        }

        if (stackTrace) {
            console.log(stackTrace);
        }

    };

    if (typeof exports !== 'undefined' && module.exports) {
        module.exports = ServiceException;
    } else {
        if (!window.TIS) {
            window.TIS = {};
        }
        window.TIS.ServiceException = ServiceException;
    }
})();