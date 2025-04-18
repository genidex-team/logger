
const path = require('path');
require('dotenv').config()

if (process.env['DISABLE_LOGGER'] == undefined || process.env['DISABLE_LOGGER'].toLowerCase() != 'true') {
    require('./colors');
    overrideLog();
}

function overrideLog() {

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
            var fileNameLine = getFileNameLineColNum(initiator);
            originalMethod.apply(console, [...args, '\t', fileNameLine.grey]);
        };
    });
}

function getFileNameLineColNum(initiator) {
    /**
     * example:
     * initiator = "at getFileNameLineColNum (/www/src/helpers/logger.js:34:13)";
     */

    var arr = initiator.match(/\/[^\)]+/g);
    var file = arr[0] || '';
    var relativePath = path.relative('.', file);
    return relativePath;
}
