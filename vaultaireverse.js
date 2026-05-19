#!/usr/bin/env node
// VaultAI Reverse — interactive demo state manager for VaultAI

import { execSync } from 'child_process';
import { createRequire } from 'module';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const REPO = 'sebslack123/VaultAI';
const FILE = 'index.html';

// ── Colours ────────────────────────────────────────────────
const col = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  bgreen: '\x1b[92m',
  red:    '\x1b[31m',
  bred:   '\x1b[91m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bcyan:  '\x1b[96m',
  mag:    '\x1b[35m',
  bmag:   '\x1b[95m',
  gray:   '\x1b[90m',
  white:  '\x1b[97m',
  bgMag:  '\x1b[45m',
};
const clr = (c, s) => `${c}${s}${col.reset}`;

// gradient: pink → yellow → green → teal → blue (mirrors RepoReverse)
const LOGO_COLORS = [
  '\x1b[38;2;255;100;200m',
  '\x1b[38;2;255;150;100m',
  '\x1b[38;2;255;210;80m',
  '\x1b[38;2;160;230;80m',
  '\x1b[38;2;80;220;180m',
  '\x1b[38;2;100;180;255m',
];

// ── ASCII banner ───────────────────────────────────────────
function printBanner() {
  let figlet;
  try { figlet = require('figlet'); } catch { figlet = null; }

  console.clear();

  if (figlet) {
    const text = figlet.textSync('VaultAI', { font: 'Big', horizontalLayout: 'default' });
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      const color = LOGO_COLORS[i % LOGO_COLORS.length];
      console.log(`  ${color}${line}${col.reset}`);
    });
    const revColor = LOGO_COLORS[LOGO_COLORS.length - 1];
    console.log(`  ${revColor}  Reverse${col.reset}`);
  } else {
    const pink = '\x1b[38;2;255;100;200m';
    const lime = '\x1b[38;2;160;230;80m';
    console.log(`\n  ${pink}██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗${lime} █████╗ ██╗${col.reset}`);
    console.log(`  ${pink}██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝${lime}██╔══██╗██║${col.reset}`);
    console.log(`  ${pink}██║   ██║███████║██║   ██║██║     ██║   ${lime}███████║██║${col.reset}`);
    console.log(`  ${pink}╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   ${lime}██╔══██║██║${col.reset}`);
    console.log(`  ${pink} ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   ${lime}██║  ██║██║${col.reset}`);
    console.log(`  ${pink}  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   ${lime}╚═╝  ╚═╝╚═╝${col.reset}`);
    console.log(`\n  ${lime}  R E V E R S E${col.reset}`);
  }

  console.log('');
  console.log(
    `  ${col.bgMag}${col.white}${col.bold} CONTROL CENTER ${col.reset}  ` +
    clr(col.bold + col.white, 'AI Demo Repo Control Center')
  );
  console.log(`  ${clr(col.dim + col.white, 'Reset, fix, and manage your VaultAI demo — effortlessly.')}`);
  console.log('');
  console.log(clr(col.gray, '  Use ↑/↓ arrows to move, Enter to choose, Ctrl+C to exit.'));
  console.log('');
}

// ── GitHub API helpers ─────────────────────────────────────
function gh(args) {
  return execSync(`gh api ${args}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
}

function getFileInfo() {
  const raw = gh(`repos/${REPO}/contents/${FILE}`);
  const json = JSON.parse(raw);
  const content = Buffer.from(json.content, 'base64').toString('utf8');
  return { sha: json.sha, content };
}

function putFile(content, sha, message) {
  const b64 = Buffer.from(content).toString('base64');
  gh(`repos/${REPO}/contents/${FILE} --method PUT -f message="${message}" -f content="${b64}" -f sha="${sha}"`);
}

function currentState() {
  try {
    const { content } = getFileInfo();
    if (content.includes('VaultFlowAI — up to 50 workflows')) return 'addon';
    return 'demo';
  } catch { return 'unknown'; }
}

// ── State display ──────────────────────────────────────────
function getStatusLine() {
  const state = currentState();

  const stateStr = state === 'demo'
    ? clr(col.bgreen + col.bold, '● DEMO READY')
    : state === 'addon'
    ? clr(col.bcyan + col.bold,  '● VAULTFLOWAI ADD-ON ACTIVE')
    : clr(col.yellow, '● UNKNOWN');

  return { state, stateStr };
}

function printStatus() {
  const { state, stateStr } = getStatusLine();

  console.log('');
  console.log(clr(col.bold + col.white, '  ┌─ Current Demo State ───────────────────────┐'));
  console.log(`  │  Source :  ${clr(col.gray, 'github.com/' + REPO).padEnd(40)}  │`);
  console.log(`  │  State  :  ${stateStr.padEnd(40)}  │`);
  console.log(clr(col.bold + col.white, '  └─────────────────────────────────────────────┘'));
  console.log('');

  if (state === 'demo') {
    console.log(`  ${clr(col.bgreen, '✓')} Pricing is demo-ready — no VaultFlowAI add-on visible`);
  } else if (state === 'addon') {
    console.log(`  ${clr(col.bcyan, '✓')} VaultFlowAI add-on is active in pricing — reset to hide it`);
  }
  console.log('');
}

// ── Core operations ────────────────────────────────────────
function doReset() {
  try {
    process.stdout.write(clr(col.bcyan, '\n  → Reading live state from GitHub...'));
    const { sha, content } = getFileInfo();

    const updated = content
      .replace(/[ \t]*<li>VaultFlowAI — up to 50 workflows<\/li>\n/g, '')
      .replace(/[ \t]*<li>VaultFlowAI — unlimited workflows<\/li>\n/g, '');

    if (updated === content) {
      console.log(clr(col.yellow, '\n  ✓ Already in DEMO READY state — no changes needed.\n'));
      return true;
    }

    process.stdout.write(clr(col.bcyan, ' pushing demo-ready state...'));
    putFile(updated, sha, 'chore: reset to demo-ready state — remove VaultFlowAI add-on [vaultaireverse]');
    console.log(clr(col.bgreen, '\n  ✓ Done! VaultFlowAI removed from pricing.'));
    console.log(clr(col.gray,   '  Netlify will update in ~30 seconds.\n'));
    return true;
  } catch (e) {
    console.log(clr(col.bred, '\n  ✗ Failed: ' + e.message + '\n'));
    return false;
  }
}

function doAddAddon() {
  try {
    process.stdout.write(clr(col.bcyan, '\n  → Reading live state from GitHub...'));
    const { sha, content } = getFileInfo();

    if (content.includes('VaultFlowAI — up to 50 workflows')) {
      console.log(clr(col.yellow, '\n  ✓ VaultFlowAI add-on already active — no changes needed.\n'));
      return true;
    }

    const updated = content
      .replace(
        /(\s*)(<li>VaultTransact — up to 1M tx\/month<\/li>)/,
        '$1<li>VaultFlowAI — up to 50 workflows</li>\n$1$2'
      )
      .replace(
        /(\s*)(<li>VaultTransact — up to 50M tx\/month<\/li>)/,
        '$1<li>VaultFlowAI — unlimited workflows</li>\n$1$2'
      );

    process.stdout.write(clr(col.bcyan, ' pushing add-on state...'));
    putFile(updated, sha, 'feat: add VaultFlowAI add-on to pricing plans [vaultaireverse]');
    console.log(clr(col.bgreen, '\n  ✓ Done! VaultFlowAI add-on is now visible in pricing.'));
    console.log(clr(col.gray,   '  Netlify will update in ~30 seconds.\n'));
    return true;
  } catch (e) {
    console.log(clr(col.bred, '\n  ✗ Failed: ' + e.message + '\n'));
    return false;
  }
}

// ── Interactive menu ───────────────────────────────────────
async function interactiveMenu() {
  let select, Separator;
  try {
    const mod = await import('@inquirer/prompts');
    select    = mod.select;
    Separator = mod.Separator;
  } catch {
    console.log(clr(col.bred, '\n  @inquirer/prompts not found — run: npm install\n'));
    process.exit(1);
  }

  while (true) {
    printBanner();
    process.stdout.write(clr(col.gray, '  Checking GitHub... '));
    const { state, stateStr } = getStatusLine();
    process.stdout.write('\r' + ' '.repeat(30) + '\r');

    console.log(`  Current state: ${stateStr}\n`);

    const action = await select({
      message: 'Main menu: pick what you want to do',
      choices: [
        { name: '  1  Reset to DEMO READY      — removes VaultFlowAI add-on', value: 'reset' },
        { name: '  2  Add VaultFlowAI add-on   — adds VaultFlowAI to pricing', value: 'addon' },
        { name: '  3  Check status             — see current repo state', value: 'status' },
        new Separator(),
        { name: '  0  Exit', value: 'quit' },
      ],
      loop: false,
      pageSize: 8,
    });

    if (action === 'quit') {
      console.log(clr(col.gray, '\n  Bye.\n'));
      process.exit(0);
    }

    if (action === 'status') {
      printBanner();
      printStatus();
    } else if (action === 'reset') {
      doReset();
    } else if (action === 'addon') {
      doAddAddon();
    }

    await new Promise(r => setTimeout(r, 2000));
  }
}

// ── Entry point ────────────────────────────────────────────
const cmd = process.argv[2];

if (!cmd) {
  interactiveMenu();
} else {
  switch (cmd) {
    case 'reset': case 'demo': doReset();      break;
    case 'addon':              doAddAddon();   break;
    case 'status':             printBanner(); printStatus(); break;
    case '--help': case '-h':
      printBanner();
      console.log('  Direct commands (skip the menu):');
      console.log(`    ${clr(col.cyan, 'node vaultaireverse.js reset')}   Reset to demo-ready (removes add-on)`);
      console.log(`    ${clr(col.cyan, 'node vaultaireverse.js addon')}   Add VaultFlowAI to pricing`);
      console.log(`    ${clr(col.cyan, 'node vaultaireverse.js status')}  Show current state`);
      console.log(`    ${clr(col.cyan, 'node vaultaireverse.js')}         Open interactive menu`);
      console.log('');
      break;
    default:
      console.log(clr(col.bred, `\n  Unknown command: ${cmd}`));
      process.exit(1);
  }
}
