#!/usr/bin/env node
/* Multi-severity byte chart of HWD logs (0..63) with per-cell maximum severity.
 *
 * Severity levels (ascending 0..4):
 *   0 = ok
 *   1 = unusual
 *   2 = very unusual
 *   3 = Worrying and very unusual
 *   4 = EXTREMELY Worrying and very unusual
 *
 * Display glyphs (index = severity) from thick to thin:
 *   0 █
 *   1 ▓
 *   2 ▒
 *   3 ░
 *   4 F
 *
 * Color progression (green -> yellow -> red).
 * Colors only applied when stdout is a TTY and not suppressed.
 *
 * Each bar cell shows MAX severity of any snapshot whose processed byte value
 * lies inside the cell's byte span. If no snapshot falls inside the span,
 * the latest snapshot before the span start determines severity (state persists).
 *
 * Missing file => blank bar.
 *
 * Options:
 *   --no-color    Disable ANSI colors.
 */
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');
const BAR_LEN = 60;

const processedRe = /^processed\s+([0-9.+-eE]+)\s+bytes\s+in\s+([0-9.+-eE]+)\s+seconds/i;
const pLineRe = /^p\s*=\s*([0-9.eE+-]+)\s*\(([^)]+)\)/i;
const finalMarkerRe = /^final\s*$/i;

function parseNumber(s) {
    if (!s) {
        return NaN;
    }
    s = s.replace(/,/g, '');
    const v = Number(s);
    return isNaN(v) ? NaN : v;
}

function readLines(filePath) {
    return fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
}

/* Map verdict string to severity number 0..4 */
function severityOf(status) {
    const s = status.toLowerCase();
    if (s.includes('extremely')) {
        return 4;               // EXTREMELY Worrying and very unusual
    }
    if (s.includes('worrying')) {
        return 3;                // Worrying and very unusual
    }
    if (s.includes('very')) {
        return 2;                    // very unusual
    }
    if (s.includes('unusual')) {
        return 1;                 // unusual
    }
    return 0;                                            // ok
}

function parseLog(filePath) {
    if (!fs.existsSync(filePath)) {
        return {
            file: path.basename(filePath),
            blocks: [],
            finalBytes: null
        };
    }
    const lines = readLines(filePath);
    const blocks = [];
    let pendingBytes = null;
    let seenFinal = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            continue;
        }

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
                // duplicate -> skip
                continue;
            } else {
                blocks.push({
                    bytes: pendingBytes,
                    p: pVal,
                    status,
                    sev: severityOf(status),
                    final: seenFinal
                });
            }
            continue;
        }
    }

    if (!blocks.length) {
        return {
            file: path.basename(filePath),
            blocks: [],
            finalBytes: null
        };
    }

    const finalBytes = blocks[blocks.length - 1].bytes;
    return {
        file: path.basename(filePath),
        blocks,
        finalBytes
    };
}

/* Determine severity for cell span by MAX severity among snapshots within range.
   If none inside, use last snapshot before cell start. */
function cellSeverity(blocks, cellStart, cellEnd) {
    if (!blocks.length) {
        return 0;
    }
    let maxSev = -1;
    for (const b of blocks) {
        if (b.bytes >= cellStart && b.bytes < cellEnd) {
            if (b.sev > maxSev) {
                maxSev = b.sev;
            }
        }
    }
    if (maxSev >= 0) {
        return maxSev;
    }
    // fallback to last before cellStart
    let lastBefore = null;
    for (const b of blocks) {
        if (b.bytes < cellStart) {
            lastBefore = b;
        } else {
            break;
        }
    }
    return lastBefore ? lastBefore.sev : 0;
}

const severityChars = ['█','▓','▒','░','F']; // Thick to thin (0->4)
const colorCodes = [
  '\x1b[32m', // 0 ok green
  '\x1b[32m', // 1 unusual bright green
  '\x1b[33m', // 2 very unusual yellow
  '\x1b[31m', // 3 worrying bright red
  '\x1b[31m'  // 4 extreme red
];
const ANSI_RESET = '\x1b[0m';

function buildBar(maxBytes, finalBytes, blocks, useColor) {
    if (finalBytes == null || isNaN(finalBytes) || finalBytes <= 0) {
        return ' '.repeat(BAR_LEN);
    }
    const finalPos = Math.min(BAR_LEN, Math.max(1, Math.round(finalBytes / maxBytes * BAR_LEN)));

    // First pass: compute per-cell severities.
    const sevArr = new Array(finalPos);
    for (let i = 0; i < finalPos; i++) {
        const cellStart = i / finalPos * finalBytes;
        const cellEnd = (i + 1) / finalPos * finalBytes;
        sevArr[i] = cellSeverity(blocks, cellStart, cellEnd);
    }
    // Patch: ensure the final cell reflects severity of the snapshot at the exact
    // finalBytes boundary. The last snapshot's byte count equals finalBytes, but
    // cellSeverity uses a half-open interval [start, end) so the boundary element
    // was excluded from the last cell, causing an extreme (severity 4) verdict
    // not to render 'F' in the final bar position.
    if (finalPos > 0 && blocks.length) {
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock && lastBlock.bytes === finalBytes) {
            // Preserve any higher severity already present via interior samples.
            if (lastBlock.sev > sevArr[finalPos - 1]) {
                sevArr[finalPos - 1] = lastBlock.sev;
            }
        }
    }

    if (!useColor) {
        // Emit glyphs then pad to BAR_LEN.
        return sevArr.map(s => severityChars[s]).join('').padEnd(BAR_LEN, ' ');
    }

    // Multipass emission: group consecutive cells of identical severity into segments.
    let out = '';
    let i = 0;
    while (i < finalPos) {
        const runSev = sevArr[i];
        let j = i + 1;
        while (j < finalPos && sevArr[j] === runSev) {
            j++;
        }
        const runLen = j - i;
        const glyph = severityChars[runSev];
        out += colorCodes[runSev] + glyph.repeat(runLen);
        i = j;
    }

    // Pad trailing width (no color).
    out += ANSI_RESET;
    if (finalPos < BAR_LEN) {
        out += ' '.repeat(BAR_LEN - finalPos);
    }
    return out;
}

function main() {
    const args = process.argv.slice(2);
    const noColor = args.includes('--no-color');
    const useColor = !noColor && process.stdout.isTTY;

    if (!fs.existsSync(logDir)) {
        console.error('No logs directory:', logDir);
        process.exit(1);
    }

    const parsed = [];
    let maxBytes = 0;
    
    // Get list of existing log files
    const existingFiles = fs.readdirSync(logDir)
        .filter(file => file.endsWith('.log'));

    for (const file of existingFiles) {
        const r = parseLog(path.join(logDir, file));
        parsed.push(r);
        if (r.finalBytes != null && !isNaN(r.finalBytes) && r.finalBytes > maxBytes) {
            maxBytes = r.finalBytes;
        }
    }

    if (maxBytes <= 0) {
        console.error('No valid final bytes found in any logs.');
        process.exit(1);
    }

    console.log('HWD Log Severity Byte Chart (per-cell MAX severity, max final bytes=' + maxBytes.toExponential(3) + ')');
    console.log('');
    console.log('File     Bar');
    console.log('-------- ' + '-'.repeat(BAR_LEN));
    for (const r of parsed) {
        const bar = buildBar(maxBytes, r.finalBytes, r.blocks, useColor);
        const fileLabel = r.file.padEnd(8);
        console.log(fileLabel + ' ' + bar);
    }
    console.log('');
    console.log('Legend (severity 0..4):');
    function leg(idx, label) {
        const glyph = severityChars[idx];
        const coloredGlyph = useColor ? (colorCodes[idx] + glyph + ANSI_RESET) : glyph;
        console.log(`  ${idx}: ${coloredGlyph} = ${label}`);
    }
    leg(0,'ok');
    leg(1,'unusual');
    leg(2,'very unusual');
    leg(3,'Worrying and very unusual');
    leg(4,'EXTREMELY Worrying and very unusual');
}

if (require.main === module) {
    main();
}
