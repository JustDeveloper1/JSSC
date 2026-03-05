import { readFileSync, writeFileSync } from 'fs';

const filePath = 'node_modules/unicode-emoji-json/data-by-emoji.json';

try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
  
    const transformed = Object.fromEntries(
        Object.keys(data).map(key => [key, true])
    );

    writeFileSync(filePath, JSON.stringify(transformed, null, 2));
} catch (err) {
    console.error(err);
    process.exit(1);
}
