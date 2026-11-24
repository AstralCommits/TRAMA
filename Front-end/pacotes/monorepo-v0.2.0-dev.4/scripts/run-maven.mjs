import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = resolve(root, 'Back-end');
const isWindows = process.platform === 'win32';
const executable = isWindows ? 'mvnw.cmd' : 'bash';
const args = process.argv.slice(2);
if (args.length === 0) args.push('test');
const commandArgs = isWindows ? args : ['./mvnw', ...args];
const result = spawnSync(executable, commandArgs, {
  cwd: backend,
  stdio: 'inherit',
  shell: isWindows,
  env: process.env,
});
if (result.error) {
  console.error(`Não foi possível executar o Maven Wrapper: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
