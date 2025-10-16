_just: title: JSSC
#### An UMD compression algorithm for strings in JavaScript.
Advanced string compression library supporting multiple languages and character encodings.
- 🗜️ High compression ratios (up to 8:1 for numbers)
- 🌍 Multilingual support (English, Russian, Japanese, Hindi, Bengali, and more)
- 🔧 Zero dependencies
- 📦 TypeScript support

## Installation
Install via npm
```
npm i strc
```

Or you can use it on your website by inserting the following HTML `script` tag.
```html
<script type="text/javascript" src="https://jssc.js.org/script.js"></script>
```

## Usage
#### JavaScript
```js
const { compress, decompress } = require('strc');

const example = compress("Hello, world!");
decompress(example);
```

#### TypeScript
```ts
import { compress, decompress } from 'strc';

const example = compress("Hello, world!");
decompress(example);
```

#### Browsers/Frontend (static websites)
```html
<script type="text/javascript" src="https://jssc.js.org/script.js"></script>
```
```js
const compressed   = JSSC.compress("Hello, world!");
const decompressed = JSSC.decompress(compressed);
```

## API
#### `compress(str: string): string`
Compresses a string and returns the compressed result.
#### `decompress(str: string): string`
Decompresses a previously compressed string.

## Demo
Try JavaScript String Compressor in your browser:

<script src="script.js" defer></script>
<script src="demo.js" defer></script>
<script src="test.js" defer></script>
<div style="gap: 11px; display: flex; margin-top: -61px;">
    <button onclick="compress()">Compress</button>
    <button onclick="decompress()">Decompress</button>
</div>

## License
[MIT © 2025 JustDeveloper](https://github.com/JustDeveloper1/JSSC/blob/main/LICENSE)
