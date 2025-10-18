#!/usr/bin/env node
/* Scan HWD log files and summarize p-value progression.
 *
 * For each *.log in ./logs:
 *  - Parse sequential test result blocks (each overall block ends with a 'p = ... (...)' line).
 *  - Extract:
 *      processed bytes (from 'processed ... bytes' line preceding each p line)
 *      overall p-value (from 'p = ... (status)' line)
 *      classification status (text inside parentheses)
 *  - Compute per-file:
 *      final bytes
 *      final p / status
 *      last_ok: last bytes at which status contains the word 'ok'
 *
 * Output:
 *  Table (sorted by descending last_ok bytes, then status ascending):
 *      file | bytes_processed | p_value | status | last_ok | final
 *  Final status counts.
 */
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');

function parseNumber(s) {
    if (!s) return NaN;
    s = s.replace(/,/g, '');
    const v = Number(s);
    return isNaN(v) ? NaN : v;
}

function readLines(filePath) {
    return fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
}

const processedRe = /^processed\s+([0-9.+-eE]+)\s+bytes\s+in\s+([0-9.+-eE]+)\s+seconds/i;
const pLineRe = /^p\s*=\s*([0-9.eE+-]+)\s*\(([^)]+)\)/i;
const finalMarkerRe = /^final\s*$/i;

/* Map verdict string to severity number 0..4 (aligned with chart.js)
   0 ok
   1 unusual
   2 very unusual
   3 Worrying and very unusual
   4 EXTREMELY Worrying and very unusual */
function severityOf(status) {
    const s = status.toLowerCase();
    if (s.includes('extremely')) return 4;
    if (s.includes('worrying')) return 3;
    if (s.includes('very')) return 2;
    if (s.includes('unusual')) return 1;
    return 0;
}
const severityLabels = [
    'OK',
    'unusual',
    'very unusual',
    'worrying',
    'fail'
];

function parseLog(filePath) {
    const lines = readLines(filePath);
    const blocks = [];
    let pendingBytes = null;
    let seenFinal = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const mProc = processedRe.exec(line);
        if (mProc) {
            pendingBytes = parseNumber(mProc[1]);
            continue;
        }

        if (finalMarkerRe.test(line)) {
            seenFinal = true;
            continue;
        }

        const mP = pLineRe.exec(line);
        if (mP) {
            const pVal = parseNumber(mP[1]);
            const status = mP[2].trim();
            const last = blocks[blocks.length - 1];
            if (last && last.bytes === pendingBytes && last.p === pVal && last.status === status) {
                // duplicate (e.g., 'final' duplication) -> skip
            } else {
                blocks.push({
                    bytes: pendingBytes,
                    p: pVal,
                    status,
                    final: seenFinal
                });
            }
            continue;
        }
        // Ignore other lines (mix3 extreme etc.).
    }

    if (!blocks.length) {
        return {
            file: path.basename(filePath),
            blocks: [],
            final: null,
            lastOk: null,
            hasFinal: seenFinal
        };
    }

    const finalBlock = blocks[blocks.length - 1];
    let lastOkBytes = null;
    for (let i = blocks.length - 1; i >= 0; i--) {
        if (/ok/i.test(blocks[i].status)) {
            lastOkBytes = blocks[i].bytes;
            break;
        }
    }

    return {
        file: path.basename(filePath),
        blocks,
        final: finalBlock,
        lastOk: lastOkBytes,
        hasFinal: seenFinal
    };
}

function summarize(results) {
    // Sort by descending last_ok bytes (missing => -Infinity, so last),
    // then by status severity ascending (0 ok .. 4 extreme)
    results.sort((a, b) => {
        const ax = a.lastOk != null ? a.lastOk : -Infinity;
        const bx = b.lastOk != null ? b.lastOk : -Infinity;
        if (bx !== ax) return bx - ax;
        const sa = a.final ? severityOf(a.final.status) : Number.MAX_SAFE_INTEGER;
        const sb = b.final ? severityOf(b.final.status) : Number.MAX_SAFE_INTEGER;
        return sa - sb;
    });

    const rows = [];
    const statusCounts = [0,0,0,0,0];

    for (const r of results) {
        if (!r.final) {
            rows.push([r.file, '-', '-', '-', '-', '-']);
            continue;
        }
        const sev = severityOf(r.final.status);
        statusCounts[sev]++;
        const finalLabel = severityLabels[sev];
        rows.push([
            r.file,
            r.final.bytes != null ? r.final.bytes.toExponential(6) : '-',
            r.final.p != null ? r.final.p.toExponential(6) : '-',
            finalLabel,
            r.lastOk != null ? r.lastOk.toExponential(6) : '-',
            r.hasFinal ? '*' : '-'
        ]);
    }

    const header = ['file','bytes_processed','p_value','status','last_ok','final'];

    const colWidths = header.map((h, idx) =>
        Math.max(
            h.length,
            ...rows.map(r => r[idx].length)
        )
    );

    function pad(str, w) { return str + ' '.repeat(w - str.length); }

    console.log(colWidths.map((w,i)=>pad(header[i], w)).join('  '));
    console.log(colWidths.map(w => '-'.repeat(w)).join('  '));
    for (const r of rows) {
        console.log(colWidths.map((w,i)=>pad(r[i], w)).join('  '));
    }

    console.log('');
    console.log('Final status counts:');
    for (let i = 0; i < statusCounts.length; i++) {
        const v = statusCounts[i];
        if (v) console.log(`  ${i} (${severityLabels[i]}): ${v}`);
    }

}

function main() {
    if (!fs.existsSync(logDir)) {
        console.error('No logs directory:', logDir);
        process.exit(1);
    }
    const files = fs.readdirSync(logDir)
        .filter(f => f.endsWith('.log'))
        .sort((a,b)=> {
            const na = Number(a.split('.')[0]);
            const nb = Number(b.split('.')[0]);
            if (isNaN(na) || isNaN(nb)) return a.localeCompare(b);
            return na - nb;
        });

    if (!files.length) {
        console.error('No log files found.');
        process.exit(1);
    }

    const results = files.map(f => parseLog(path.join(logDir, f)));
    summarize(results);
}

if (require.main === module) {
    main();
}
