npm install
mkdir dist

node src/emoji.js
rm -f src/emoji.js

npx rollup -c

reserved="reserved=['compress','decompress','JSSC','jssc','compressLarge','compressToBase64','compressLargeToBase64','decompressFromBase64','cache','version','JSSC1']"
npx terser dist/jssc.js -c -m "$reserved" --format "ascii_only=true" -o dist/jssc.min.js
npx terser dist/worker.js -c -m "$reserved" --module --format "ascii_only=true" -o dist/worker.min.js
cp dist/jssc.js index.js
cp dist/jssc.min.js index.min.js
cp dist/worker.js worker.js
cp dist/worker.min.js worker.min.js
cp src/index.d.ts dist/jssc.d.ts
cp src/index.d.ts index.d.ts

bash src/prefix.sh
