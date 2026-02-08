npm install
mkdir dist

npx rollup -c
npx uglifyjs dist/jssc.js -c -m "reserved=['compress','decompress','JSSC','jssc']" -o index.min.js
cp dist/jssc.js index.js

npm test
