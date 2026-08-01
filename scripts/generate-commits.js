import fs from 'node:fs';
import { execSync } from 'node:child_process';

try {
  const raw = execSync(`git log -n 50 --pretty=format:'{"hash":"%h","fullHash":"%H","date":"%ad","message":"%s"}' --date=short`, { encoding: 'utf-8' });
  const lines = raw.trim().split('\n').filter(Boolean);
  const commits = lines.map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);

  fs.writeFileSync('./app/lib/commits.json', JSON.stringify(commits, null, 2));
  console.log(`Generated app/lib/commits.json with ${commits.length} commits.`);
} catch (err) {
  console.error('Failed to generate commits.json:', err);
  if (!fs.existsSync('./app/lib/commits.json')) {
    fs.writeFileSync('./app/lib/commits.json', '[]');
  }
}
