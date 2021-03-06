var util = require('util');
var colors = require('colors');

/**
 * The level to log at, change this to alter the global logging level.
 * Possible options are: error, warn, info, debug. Default level is info.
 */
exports.level = 'info';

exports.symbols = {
    ok: '✓',
    err: '✖'
};

// With node.js on Windows: use symbols available in terminal default fonts
if ('win32' == process.platform) {
    exports.symbols.ok = '\u221A';
    exports.symbols.err = '\u00D7';
}

// Colors of the logging level 
exports.colors = {
    label: 'cyan',
    debug : 'blue',
    info : 'green',
    warn : 'yellow',
    error : 'red'
};

exports.prefix = '  >>';
exports.prefixs = {
    debug : exports.prefix[exports.colors.debug],
    info : exports.prefix[exports.colors.info],
    warn : exports.prefix[exports.colors.warn],
    error : exports.prefix[exports.colors.error]
};

/**
 * Executes a function only if the current log level is in the levels list
 *
 * @param {Array} levels
 * @param {Function} fn
 */
var level = function (levels, fn) {
    return function (label, msg) {
        for (var i = 0; i < levels.length; i++) {
            if (levels[i] === exports.level) {
                return fn(label, msg);
            }
        }
    };
};

/**
 * Logs debug messages, using util.inspect to show the properties of objects
 * (logged for 'debug' level only)
 */
exports.debug = level(['debug'], function (label, msg) {
    if (msg === undefined) {
        msg = label;
        label = null;
    }
    if (typeof msg !== 'string') {
        msg = util.inspect(msg);
    }

    if (label) {
        console.log(exports.prefixs.debug, label[exports.colors.label], msg);
    }else {
        console.log(exports.prefixs.debug, msg);
    }
});

/**
 * Logs info messages (logged for 'info' and 'debug' levels)
 */
exports.log = exports.info = level(['info', 'debug'], function (label, msg) {

    if (msg === undefined) {
        msg = label;
        label = null;
    }

    if (typeof msg !== 'string') {
        msg = util.inspect(msg);
    }

    // hard code for format output
    msg = msg.replace(/\\/g, '/').replace(/>+/g, ">".grey);

    if (label) {
        console.log(exports.prefixs.info, label[exports.colors.label], msg);
    }else {
        console.log(exports.prefixs.info, msg);
    }
});

/**
 * Logs warnings messages (logged for 'warn', 'info' and 'debug' levels)
 */
exports.warn = function (label, msg) {
    if (msg === undefined) {
        msg = label;
        label = null;
    }

    if (typeof msg !== 'string') {
        msg = util.inspect(msg);
    }

    if (label) {
        console.log( exports.prefixs.warn, label[exports.colors.label], msg );
    }else{
        console.log( exports.prefixs.warn, msg[exports.colors.warn] );
    }

};

/**
 * Logs error messages (always logged)
 */
exports.error = function (label, err) {
    if (msg === undefined) {
        err = label;
        label = null;
    }
    var msg = err.message || err.error || err;
    if (err.stack) {
        msg = err.stack;
    }

    if (label) {
        console.log(exports.prefixs.error, label[exports.colors.label], msg);
    }else{
        console.log(exports.prefixs.error, msg[exports.colors.error]);
    }

    exports.exitWithError = true;
};

exports.end = function (msg) {
    if (!exports.exitWithError) {
        console.log( ('\n' + exports.symbols.ok + ' OK' + (msg ? ': '.bold + msg: '')).bold.green );
    }
};

process.on('uncaughtException', function (err) {
    exports.error(err);
});

process.on('exit', function onExit() {
    if (exports.exitWithError) {
        console.log( ('\n' + exports.symbols.err + ' Failed').bold.red );
        process.removeListener('exit', onExit);
        process.exit(1);
    }
});
