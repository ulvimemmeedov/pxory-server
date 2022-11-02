const fs = require('fs');
const path = require('path');

const logger = (text, color) => {
    color = color.toLowerCase();
    let c = "\x1b[0m%s\x1b[0m";
    if (color) {
        if (color == "blue") c = "\x1b[36m%s\x1b[0m";
        if (color == "yellow") c = "\x1b[33m%s\x1b[0m";
        if (color == "red") c = "\x1b[31m%s\x1b[0m";
        if (color == "black") c = "\x1b[30m%s\x1b[0m";
        if (color == "white") c = "\x1b[1m%s\x1b[0m";
        if (color == "green") c = "\x1b[32m%s\x1b[0m";
        if (color == "purple") c = "\x1b[35m%s\x1b[0m";
        if (color == "gray") c = "\x1b[37m%s\x1b[0m";
    }
    console.log(c, text);
};

const parseBuffer = (src) => {
    const NEWLINES_MATCH = /\r\n|\n|\r/
    const NEWLINE = '\n'
    const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/
    const RE_NEWLINES = /\\n/g

    const obj = {};
    src.toString().split(NEWLINES_MATCH).forEach((line, idx) => {
        // matching "KEY" and "VAL" in "KEY=VAL"
        const keyValueArr = line.match(RE_INI_KEY_VAL);
        // matched?
        if (keyValueArr != null) {
            const key = keyValueArr[1];

            // default undefined or missing values to empty string

            let val = (keyValueArr[2] || '');
            const end = val.length - 1;
            const isDoubleQuoted = val[0] === '"' && val[end] === '"';
            const isSingleQuoted = val[0] === "'" && val[end] === "'";

            // if single or double quoted, remove quotes 
            if (isSingleQuoted || isDoubleQuoted) {
                val = val.substring(1, end);

                // if double quoted, expand newlines
                if (isDoubleQuoted) {
                    val = val.replace(RE_NEWLINES, NEWLINE);
                }
            } else {
                //  remove surrounding whitespace
                val = val.trim();
            }
            obj[key] = val;
        }
    });
    return obj;
}

const getEnv = () => {
    const envFilePath = path.join(__dirname, '..//..//.env');
    const bufferEnv = fs.readFileSync(envFilePath);
    const envObject = parseBuffer(bufferEnv);

    Object.keys((envObject || {})).map(key => {
        if (!process.env[key] && process.env[key] !== envObject[key]) {
            process.env[key] = envObject[key];
        }
    });
    return process.env;
}

const catchEvent = (server) => {
    server.on('error', (err) => {
        logger(err, "red");
    });
    server.on('close', () => {
        logger("client disconnected", "blue");
    });

}

module.exports = {
    getEnv,
    parseBuffer,
    catchEvent,
    logger
}