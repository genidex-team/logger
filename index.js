
const path = require('path');
require('dotenv').config()

if (process.env['DISABLE_LOGGER'] == undefined || process.env['DISABLE_LOGGER'].toLowerCase() != 'true') {
    require('./colors');
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
            originalMethod.apply(console, [...args, '\t', initiator.grey]);
        };
    });
}

function __overridePrepareStackTrace(){
    const oldPrepareStackTrace = Error.prepareStackTrace;

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
