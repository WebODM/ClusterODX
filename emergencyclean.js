#!/usr/bin/env node
// Invoke this as a cronjob if disk space runs low

const fs = require('fs');
const path = require('path');

const TMP_DIR = path.join(__dirname, 'tmp');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STALENESS_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

function walkFiles(dir) {
    var results = [];
    var names;
    try {
        names = fs.readdirSync(dir);
    } catch (e) {
        return results;
    }
    for (var i = 0; i < names.length; i++) {
        var fullPath = path.join(dir, names[i]);
        try {
            var stat = fs.statSync(fullPath);
        } catch (e) {
            continue; // skip entries we can't stat
        }
        if (stat.isDirectory()) {
            results = results.concat(walkFiles(fullPath));
        } else if (stat.isFile()) {
            results.push({ path: fullPath, size: stat.size, mtimeMs: stat.mtimeMs });
        }
    }
    return results;
}

function removeDir(dir) {
    if (typeof fs.rmSync === 'function') {
        fs.rmSync(dir, { recursive: true, force: true });
    } else {
        var names = fs.readdirSync(dir);
        for (var i = 0; i < names.length; i++) {
            var fullPath = path.join(dir, names[i]);
            var stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                removeDir(fullPath);
            } else {
                fs.unlinkSync(fullPath);
            }
        }
        fs.rmdirSync(dir);
    }
}

function main() {
    if (!fs.existsSync(TMP_DIR)) {
        console.log('tmp directory does not exist: ' + TMP_DIR);
        return;
    }

    var entries = fs.readdirSync(TMP_DIR);
    var folders = entries.filter(function (name) {
        try { return fs.statSync(path.join(TMP_DIR, name)).isDirectory(); }
        catch (e) { return false; }
    });
    var uuidFolders = folders.filter(function (name) { return UUID_REGEX.test(name); });

    if (uuidFolders.length === 0) {
        console.log('No UUID folders found in tmp.');
        return;
    }

    // Filter by staleness
    var staleFolders = [];
    var nowMs = Date.now();

    for (var i = 0; i < uuidFolders.length; i++) {
        var folderPath = path.join(TMP_DIR, uuidFolders[i]);

        var files = walkFiles(folderPath);
        if (files.length === 0) {
            continue;
        }

        var mostRecentMtimeMs = -Infinity;
        for (var j = 0; j < files.length; j++) {
            if (files[j].mtimeMs > mostRecentMtimeMs) {
                mostRecentMtimeMs = files[j].mtimeMs;
            }
        }

        var diffMs = nowMs - mostRecentMtimeMs;

        if (diffMs > STALENESS_THRESHOLD_MS) {
            var totalSize = 0;
            for (var k = 0; k < files.length; k++) {
                totalSize += files[k].size;
            }
            staleFolders.push({
                name: uuidFolders[i],
                path: folderPath,
                totalSize: totalSize,
                diffMinutes: Math.round(diffMs / 60000)
            });
        }
    }

    if (staleFolders.length === 0) {
        console.log('No stale UUID folders.');
        return;
    }

    // Sort by size descending, keep top 3
    staleFolders.sort(function (a, b) { return b.totalSize - a.totalSize; });
    var toDelete = staleFolders.slice(0, 3);

    console.log('Folders selected for deletion (' + toDelete.length + ')');
    for (var i = 0; i < toDelete.length; i++) {
        var sizeMB = (toDelete[i].totalSize / (1024 * 1024)).toFixed(2);
        console.log(
            '  ' + toDelete[i].name +
            '  size=' + sizeMB + ' MB' +
            '  age-diff=' + toDelete[i].diffMinutes + ' min'
        );
    }

    for (var i = 0; i < toDelete.length; i++) {
        try {
            removeDir(toDelete[i].path);
        } catch (e) {
            console.error('  Failed to delete: ' + e.message);
        }
    }
}

main();
