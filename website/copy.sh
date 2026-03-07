bash src/build.sh
mkdir scripts
cp index.js scripts/jssc.js
cp index.min.js scripts/jssc.min.js
cp src/index.d.ts scripts/jssc.d.ts
cp dist/jssc.cjs scripts/jssc.cjs
cp dist/jssc.mjs scripts/jssc.mjs
cp dist/worker.js srcipts/worker.js
cp dist/worker.min.js scripts/worker.min.js
