import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredPaths = [
  'VERSION',
  '.github/workflows/ci.yml',
  'README.md',
  'Frontend/package.json',
  'Frontend/package-lock.json',
  'Frontend/apps/web/package.json',
  'Back-end/pom.xml',
  'Back-end/src',
  'Banco-de-Dados',
  'docs/ISSUES-GITHUB-OFICIAIS-2026-11-23.md',
  'docs/DECISAO-DE-ESCOPO-ISSUES-17-18.md',
  'docs/issues-internas',
  'docs/issues-github',
  'docs/HISTORICO-RELEASES.md',
  'docs/GUIA-CONSOLIDACAO-MONOREPO.md',
  'Frontend/apps/web/src/home/artisan-catalog.tsx',
];
let failures = 0;
for (const relative of requiredPaths) {
  const ok = existsSync(join(root, relative));
  console.log(`${ok ? 'PASS' : 'FAIL'} estrutura: ${relative}`);
  if (!ok) failures += 1;
}
const internalDir = join(root, 'docs/issues-internas');
const internalCount = readdirSync(internalDir).filter((name) => /^FE-(1[3-9]|2[0-9]|3[01])\.md$/.test(name)).length;
console.log(`${internalCount === 19 ? 'PASS' : 'FAIL'} issues internas FE-13..FE-31: ${internalCount}/19`);
if (internalCount !== 19) failures += 1;
const officialDir = join(root, 'docs/issues-github');
const officialCount = readdirSync(officialDir).filter((name) => /^ISSUE-\d{2}\.md$/.test(name)).length;
console.log(`${officialCount === 22 ? 'PASS' : 'FAIL'} issues oficiais #1..#22: ${officialCount}/22`);
if (officialCount !== 22) failures += 1;
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const frontPackage = JSON.parse(readFileSync(join(root, 'Frontend/package.json'), 'utf8'));
const appPackage = JSON.parse(readFileSync(join(root, 'Frontend/apps/web/package.json'), 'utf8'));
const versionFile = readFileSync(join(root, 'VERSION'), 'utf8').trim();
const version = rootPackage.version;
for (const [name, pkg] of [['root', rootPackage], ['Frontend', frontPackage], ['Frontend/apps/web', appPackage]]) {
  const ok = pkg.version === version;
  console.log(`${ok ? 'PASS' : 'FAIL'} versão ${name}: ${pkg.version} (esperada ${version})`);
  if (!ok) failures += 1;
}
const versionMatches = versionFile === version;
console.log(`${versionMatches ? 'PASS' : 'FAIL'} arquivo VERSION: ${versionFile} (esperada ${version})`);
if (!versionMatches) failures += 1;
const scopeDoc = readFileSync(join(root, 'docs/DECISAO-DE-ESCOPO-ISSUES-17-18.md'), 'utf8').toLowerCase();
const issue17 = readFileSync(join(root, 'docs/issues-github/ISSUE-17.md'), 'utf8').toLowerCase();
const issue18 = readFileSync(join(root, 'docs/issues-github/ISSUE-18.md'), 'utf8').toLowerCase();
const scopeOk = scopeDoc.includes('não será transformado em marketplace') && issue17.includes('fora do escopo') && issue18.includes('fora do escopo');
console.log(`${scopeOk ? 'PASS' : 'FAIL'} decisão de escopo das issues #17/#18 documentada`);
if (!scopeOk) failures += 1;
for (const url of [
  'https://github.com/AstralCommits/Front-end/releases/tag/v0.1.0',
  'https://github.com/AstralCommits/Front-end/releases/tag/v0.2.0-dev.2',
  'https://github.com/AstralCommits/Front-end/releases/tag/v0.2.0-dev.3',
]) {
  const historic = readFileSync(join(root, 'docs/HISTORICO-RELEASES.md'), 'utf8').includes(url);
  console.log(`${historic ? 'PASS' : 'FAIL'} histórico de Release: ${url}`);
  if (!historic) failures += 1;
}
console.log(`\nResultado: ${failures === 0 ? 'estrutura consolidada aprovada' : `${failures} falha(s)`}.`);
process.exitCode = failures === 0 ? 0 : 1;
