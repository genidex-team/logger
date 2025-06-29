
const path = require('path');
require('dotenv').config()

if (process.env['DISABLE_LOGGER'] == undefined || process.env['DISABLE_LOGGER'].toLowerCase() != 'true') {
    require('./colors');
    Error.stackTraceLimit = Infinity;
    __overrideLog();
    __overridePrepareStackTrace();
}

function __overrideLog() {

    ['log', 'warn', 'error'].forEach((methodName) => {
        const originalMethod = console[methodName];
        console[methodName] = (...args) => {
            let initiator = 'unknown place';
            try {
                throw new Error();
            } catch (e) {
                // originalMethod.apply(console, [e]);
                if (typeof e.stack === 'string') {
                    let isFirst = true;
                    for (const line of e.stack.split('\n')) {
                        const matches = line.match(/^\s+at\s+(.*)/);
                        if (matches) {
                            if (!isFirst) { // first line - current function
                                // second line - caller (what we are looking for)
                                initiator = matches[1];
                                break;
                            }
                            isFirst = false;
                        }
                    }
                }
            }
            const file = getFile(initiator);
            if(methodName=='error'){
                originalMethod.apply(console, [...args]);
                originalMethod.apply(console, [file.padStart(50).grey]);
            }else{
                let padStart = getPadStart(args);
                originalMethod.apply(console, [...args, file.padStart(padStart).grey]);
            }
        };
    });

    function getFile(initiator){
        const match = initiator.match(/\.?\/[^:\s]+:\d+:\d+/);
        if (match && match[0]) {
            return match[0];
        }
        return initiator;
    }

    function getPadStart(args){
        let padStart = 50;
        for(var i in args){
            let arg = args[i];
            let type = typeof arg;
            if(type == 'string' || type == 'bigint' || type == 'number'){
                padStart -= String(arg).length;
                if(padStart<0){
                    padStart = 0;
                    break;
                }
            }
        }
        return padStart;
    }
}

function __overridePrepareStackTrace(){
    const oldPrepareStackTrace = Error.prepareStackTrace;
    if(!oldPrepareStackTrace) return;

    Error.prepareStackTrace = (error, stack) => {
        const baseDir = process.cwd();
        const oldStackTrace = oldPrepareStackTrace(error, stack);
        if (typeof oldStackTrace !== 'string') return oldStackTrace;
        let rs = '';
        for (const line of oldStackTrace.split('\n')) {
            //ex: line = "at getFileNameLineColNum (/www/src/helpers/logger.js:34:13)";
            const matches = line.match(/^\s+at\s+(.*)/);
            if (matches && matches[1]) {
                let stackTrace = matches[1];
                stackTrace = stackTrace.replace('file://', '');
                rs += '\n    at ' + stackTrace.replace(baseDir, '.');
            }else{
                rs += '\n' + line;
            }
        }
        return rs;
    };
}
