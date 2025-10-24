#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');

// Parse byte size from PractRand format like "32 kilobytes (2^15 bytes)"
function parseBytes(lengthLine) {
    const match = lengthLine.match(/2\^(\d+) bytes/);
    if (match) {
        return Math.pow(2, parseInt(match[1]));
    }
    return 0;
}

// Parse a single PractRand log file
function parseLogFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract parameters from filename
    const basename = path.basename(filePath, '.log');
    const params = basename.split('_').map(Number);
    
    if (params.length !== 6 || params.some(isNaN)) {
        return null; // Skip non-parameter log files
    }
    
    const result = {
        params: params,
        lastPass: 0,
        lastIteration: null,
        failureCount: 0,
        noAnomaliesCount: 0,
        totalFailures: 0,
        totalSuspicious: 0,
        totalUnusual: 0,
        iterations: []
    };
    
    let currentIteration = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Start of a new iteration
        if (line.startsWith('length=')) {
            if (currentIteration) {
                result.iterations.push(currentIteration);
            }
            
            const bytes = parseBytes(line);
            currentIteration = {
                bytes: bytes,
                failures: 0,
                suspicious: 0,
                unusual: 0,
                noAnomalies: 0,
                worstPValue: 1.0,
                passed: true
            };
        }
        
        // Count anomalies and parse p-values
        if (currentIteration) {
            if (line.includes('no anomalies in')) {
                const match = line.match(/no anomalies in (\d+) test result/);
                if (match) {
                    currentIteration.noAnomalies = parseInt(match[1]);
                }
            } else if (line.includes('FAIL')) {
                currentIteration.failures++;
                currentIteration.passed = false;
                // Parse p-value
                const pMatch = line.match(/p[~=]\s*([\d.e+-]+)/);
                if (pMatch) {
                    const pValue = parseFloat(pMatch[1]);
                    currentIteration.worstPValue = Math.min(currentIteration.worstPValue, pValue);
                }
            } else if (line.includes('suspicious')) {
                currentIteration.suspicious++;
                currentIteration.passed = false;
                // Parse p-value
                const pMatch = line.match(/p[~=]\s*([\d.e+-]+)/);
                if (pMatch) {
                    const pValue = parseFloat(pMatch[1]);
                    currentIteration.worstPValue = Math.min(currentIteration.worstPValue, pValue);
                }
            } else if (line.includes('unusual')) {
                currentIteration.unusual++;
                // unusual doesn't count as failure
            } else if (line.match(/\.\.\. ?and (\d+) test result\(s\) without anomalies/)) {
                const match = line.match(/\.\.\. ?and (\d+) test result\(s\) without anomalies/);
                if (match) {
                    currentIteration.noAnomalies = parseInt(match[1]);
                }
            }
        }
    }
    
    // Add last iteration
    if (currentIteration) {
        result.iterations.push(currentIteration);
    }
    
    // Calculate summary statistics
    for (const iteration of result.iterations) {
        if (iteration.passed) {
            result.lastPass = iteration.bytes;
        }
        if (!iteration.passed) {
            result.failureCount += iteration.failures + iteration.suspicious;
        }
        // Track totals across all iterations
        result.totalFailures += iteration.failures;
        result.totalSuspicious += iteration.suspicious;
        result.totalUnusual += iteration.unusual;
    }
    
    // Save last iteration info
    if (result.iterations.length > 0) {
        const lastIter = result.iterations[result.iterations.length - 1];
        result.lastIteration = {
            bytes: lastIter.bytes,
            failures: lastIter.failures,
            suspicious: lastIter.suspicious,
            unusual: lastIter.unusual,
            noAnomalies: lastIter.noAnomalies,
            worstPValue: lastIter.worstPValue
        };
    }
    
    return result;
}

// Main execution
function main() {
    const files = fs.readdirSync(logsDir)
        .filter(f => f.endsWith('.log') && f !== 'rng.log')
        .map(f => path.join(logsDir, f));
    
    const results = [];
    
    for (const file of files) {
        try {
            const result = parseLogFile(file);
            if (result) {
                results.push(result);
            }
        } catch (err) {
            console.error(`Error parsing ${file}:`, err.message);
        }
    }
    
    // Sort by last pass (descending), then by last test bytes (descending),
    // then by no anomalies count (descending), then by p-value distance from 0.5 (closer is better),
    // then by total failures, suspicious, and unusual (ascending)
    results.sort((a, b) => {
        // Primary: last pass (higher is better)
        if (b.lastPass !== a.lastPass) {
            return b.lastPass - a.lastPass;
        }
        
        // Secondary: last test bytes (higher is better)
        const aBytes = a.lastIteration ? a.lastIteration.bytes : 0;
        const bBytes = b.lastIteration ? b.lastIteration.bytes : 0;
        if (bBytes !== aBytes) {
            return bBytes - aBytes;
        }
        
        // Tertiary: no anomalies count (higher is better)
        const aNoAnom = a.lastIteration ? a.lastIteration.noAnomalies : 0;
        const bNoAnom = b.lastIteration ? b.lastIteration.noAnomalies : 0;
        if (bNoAnom !== aNoAnom) {
            return bNoAnom - aNoAnom;
        }
        
        // Quaternary: p-value distance from 0.5 (closer to 0.5 is better for two-sided tests)
        const aPValue = a.lastIteration ? a.lastIteration.worstPValue : 1.0;
        const bPValue = b.lastIteration ? b.lastIteration.worstPValue : 1.0;
        const aDistance = Math.abs(aPValue - 0.5);
        const bDistance = Math.abs(bPValue - 0.5);
        if (aDistance !== bDistance) {
            return aDistance - bDistance;
        }
        
        // Quinary: total failures (lower is better)
        if (a.totalFailures !== b.totalFailures) {
            return a.totalFailures - b.totalFailures;
        }
        
        // Senary: total suspicious (lower is better)
        if (a.totalSuspicious !== b.totalSuspicious) {
            return a.totalSuspicious - b.totalSuspicious;
        }
        
        // Septenary: total unusual (lower is better)
        if (a.totalUnusual !== b.totalUnusual) {
            return a.totalUnusual - b.totalUnusual;
        }
        
        // Final tiebreaker: sort by parameters lexicographically
        for (let i = 0; i < a.params.length; i++) {
            if (a.params[i] !== b.params[i]) {
                return a.params[i] - b.params[i];
            }
        }
        return 0;
    });
    
    // Output both tables using common function
    printTable('All PRNGs', results, results.length);
    console.log(`\nTotal PRNGs tested: ${results.length}`);
    printTable('\nTop 10 PRNGs', results, 10);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
    if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
    return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)}TB`;
}

function printTable(title, results, maxRows) {
    const rows = Math.min(maxRows, results.length);
    
    console.log(`\n=== ${title} ===`);
    console.log('Rank | Params           | Last Pass | Last Test  | Last Iter   | Total All   | No Anom | P-Value    | Iters');
    console.log('-----|------------------|-----------|------------|-------------|-------------|---------|------------|-------');
    
    for (let i = 0; i < rows; i++) {
        const r = results[i];
        const params = r.params.join(' ');
        const lastPass = formatBytes(r.lastPass);
        const lastTest = r.lastIteration ? formatBytes(r.lastIteration.bytes) : 'N/A';
        const lastF = r.lastIteration ? r.lastIteration.failures : 0;
        const lastS = r.lastIteration ? r.lastIteration.suspicious : 0;
        const lastU = r.lastIteration ? r.lastIteration.unusual : 0;
        const lastIter = r.lastIteration ? `${lastF}F ${lastS}S ${lastU}U` : 'N/A';
        const totalAll = `${r.totalFailures}F ${r.totalSuspicious}S ${r.totalUnusual}U`;
        const noAnomalies = r.lastIteration ? r.lastIteration.noAnomalies : 'N/A';
        const pValue = r.lastIteration ? 
            (r.lastIteration.worstPValue < 1.0 ? r.lastIteration.worstPValue.toExponential(2) : '1.0') : 'N/A';
        const iterations = r.iterations.length;
        
        console.log(`${String(i+1).padStart(4)} | ${params.padEnd(16)} | ${lastPass.padEnd(9)} | ${lastTest.padEnd(10)} | ${lastIter.padEnd(11)} | ${totalAll.padEnd(11)} | ${String(noAnomalies).padStart(7)} | ${String(pValue).padEnd(10)} | ${String(iterations).padStart(5)}`);
    }
}

main();
