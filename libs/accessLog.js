/**
 *  ClusterODM - A reverse proxy, load balancer and task tracker for NodeODM
 *  Copyright (C) 2018-present MasseranoLabs LLC
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use strict";

let config = require('../config');
let winston = require('winston');
let fs = require('fs');
let path = require('path');

let accessLog = () => {};

if (config.accessLog.logFile){
    const logPath = path.dirname(config.accessLog.logFile);

    try {
        fs.accessSync(logPath, fs.W_OK);
    } catch (e) {
        console.log( "Access log directory '" + logPath + "' cannot be written to"  );
        throw e;
    }


    let logger = winston.createLogger({ transports: [
            new winston.transports.File({
                format: winston.format.printf(info => `${new Date().toISOString()} ${info.message}`), 
                filename: config.accessLog.logFile,
                json: false,
                maxsize: config.accessLog.maxFileSize,
                maxFiles: 1,
                level: "info"
            })
        ]});

    accessLog = (remoteIp, url) => {
        logger.info(`[${remoteIp}] ${url}`);
    }
}



module.exports = accessLog;