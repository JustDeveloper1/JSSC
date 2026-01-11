_just: title: JSSC — JavaScript String Compressor
**JSSC (JavaScript String Compressor)** is an open-source library for
lossless compression of JavaScript strings.
- ✨ **Lossless compression**
- 🗜️ **High compression ratios** (up to **8:1** for numbers)
- 🌍 **Multilingual support** (English, Russian, Japanese, Hindi, Bengali, and more)
- 📦 **JSON support** (it converts JSON to [JUSTC](https://just.js.org/justc) and then compresses JUSTC string)
- ⚙️ **`string` to `string`** - **No data objects** for decompressor in output. All data is stored in the first 16 bits (one UTF-16 character) of the string.
- 📜 TypeScript support

## Character Encoding

JSSC operates on JavaScript strings and therefore works at the
**UTF-16 code unit** level.

This means:
- The compressor supports all characters representable in JavaScript strings
- Data is processed as UTF-16, not UTF-8 bytes
- Binary data must be converted to strings before compression

## Project Name vs npm Package Name

The project is called **JSSC** (JavaScript String Compressor).

The npm package is published under the name **`strc`**, because the name
`jssc` is already occupied on npm by an unrelated Java-based package.

Both names refer to the same project.

## Installation
Install via npm
```
npm i strc
```

> The npm package name is `strc`, but the library itself is **JSSC**.

Or you can use it on your website by inserting the following HTML `script` tags.
```html
<script src="https://unpkg.com/justc"></script>
<script src="https://unpkg.com/strc"></script>
```

## Usage
```js
const { compress, decompress } = require('strc');

const example = await compress("Hello, world!");
await decompress(example);
```
```ts
import { compress, decompress } from 'strc';

const example = await compress("Hello, world!");
await decompress(example);
```

**Deno (server-side)**
```ts
import JSSC from 'https://jssc.js.org/script.js';

const example = await JSSC.compress("Hello, world!");
await JSSC.decompress(example);
```

**Browsers/Frontend (UMD)**
When using the UMD build via CDN, the library is exposed globally as `JSSC`.
```html
<script src="https://unpkg.com/justc"></script>
<script src="https://unpkg.com/strc"></script>
```
```js
const compressed   = await JSSC.compress("Hello, world!");
const decompressed = await JSSC.decompress(compressed);
```

## API

**`compress(str: string): Promise<string>`**
Compresses a string and returns the compressed result.

**`decompress(str: string): Promise<string>`**
Decompresses a previously compressed string.

## Demo
Try JavaScript String Compressor in your browser:

<script src="https://unpkg.com/justc"></script>
<script src="https://unpkg.com/strc"></script>
<script src="demo.js" defer></script>
<script src="test.js" defer></script>
<div style="gap: 11px; display: flex; margin-top: -61px;">
    <button onclick="compress()">Compress</button>
    <button onclick="decompress()">Decompress</button>
</div>

## Dependencies
JSSC depends on:
- <img align="top" src="https://just.js.org/justc/logo-50.svg" alt="JUSTC Logo" width="26" height="26"> [JUSTC](https://just.js.org/justc) by [JustStudio.](https://juststudio.is-a.dev/)

## License
[MIT © 2025-2026 JustDeveloper](https://github.com/JustDeveloper1/JSSC/blob/main/LICENSE)

---
## `.min.js`
For `.min.js`, I use [UglifyJS](https://github.com/mishoo/UglifyJS) by [Mihai Bazon](https://github.com/mishoo).
```bash
npm i uglify-js
```
```bash
uglifyjs index.js -c -m "reserved=['JSSC','compress','decompress']" -o index.min.js
```
