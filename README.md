# JSSC — JavaScript String Compressor
**JSSC (JavaScript String Compressor)** is an open-source, **lossless string compression algorithm** designed specifically for JavaScript.

It operates directly on JavaScript strings (UTF-16) and produces compressed data that is also a valid JavaScript string.

JSSC is distributed as a **UMD module** and can be used in browsers, Node.js, Deno, and other JavaScript environments.

## Key Features
- ✨ **Lossless compression**
- 🗜️ **High compression ratios**
  - up to **8:1** for numeric data
  - strong results for repetitive and structured text
- 🌍 **Multilingual support**
  - English, Russian, Japanese, Chinese, Hindi, Bengali, and more
- 📦 **JSON support**
  - JSON is converted to [JUSTC](https://just.js.org/justc) before compression
- ⚙️ **String → String**
  - no binary buffers
  - no external metadata
  - all required information is embedded into the compressed string itself
- 🧠 **Self-validating compression**
  - every compression mode is verified by decompression before being accepted
- 🔁 **Recursive compression**
- 📜 **TypeScript definitions** included
- 🌐 **UMD build** for browsers and static websites

## Important Version Compatibility Notice
⚠️ **Compressed strings produced by JSSC v1.x.x are NOT compatible with v2.x.x**

Reasons:
- The first 16 bits (header layout) were slightly redesigned
- New compression modes were added
- Character encoding tables were extended

## Character Encoding
JSSC operates on **JavaScript UTF-16 code units**, not on UTF-8 bytes.

This means:
- Any character representable in a JavaScript string is supported
- Compression works at the UTF-16 level
- One JavaScript character = **16 bits**
- Binary data must be converted to strings before compression

## Project Name vs npm Package Name
The project is called **JSSC** (JavaScript String Compressor).

The npm package is published under the name **`strc`**, because the name `jssc` is already occupied on npm by an unrelated Java-based package.

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
#### JavaScript
```js
const { compress, decompress } = require('strc');

const example = await compress("Hello, world!");
await decompress(example);
```

#### TypeScript
```ts
import { compress, decompress } from 'strc';

const example = await compress("Hello, world!");
await decompress(example);
```

#### Deno (server-side)
```ts
import JSSC from 'https://jssc.js.org/jssc.min.js';

const example = await JSSC.compress("Hello, world!");
await JSSC.decompress(example);
```

#### Browsers / Frontend (UMD)
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
#### `compress(input: string | object | number): Promise<string>`
Compresses the input and returns a compressed JavaScript string.

#### `decompress(input: string, stringify?: boolean): Promise<string | object | number>`
Decompresses a previously compressed string/object/integer.

## Dependencies
JSSC depends on:
- <img align="top" src="https://just.js.org/justc/logo-50.svg" alt="JUSTC Logo" width="26" height="26"> [JUSTC](https://just.js.org/justc) by [JustStudio.](https://juststudio.is-a.dev/)

## License
[MIT © 2025-2026 JustDeveloper](https://github.com/JustDeveloper1/JSSC/blob/main/LICENSE)

---
## Minified Build
For `.min.js`, I use [UglifyJS](https://github.com/mishoo/UglifyJS) by [Mihai Bazon](https://github.com/mishoo).
```bash
npm i uglify-js
```
```bash
uglifyjs index.js -c -m "reserved=['compress','decompress']" -o index.min.js
```
