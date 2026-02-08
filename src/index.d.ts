/*

MIT License

Copyright (c) 2025-2026 JustDeveloper <https://justdeveloper.is-a.dev/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/*
        _______________
    __ / / __/ __/ ___/
   / // /\ \_\ \/ /__  
   \___/___/___/\___/  
                       
   JavaScript String Compressor
   https://jssc.js.org/

*/

/**
 * JavaScript String Compressor - compress options
 * @license MIT
 * @copyright (c) 2025-2026 JustDeveloper <<https://justdeveloper.is-a.dev>>
 * @since 2.0.0
 */
export interface compressOptions {
    JUSTC?: boolean,
    recursiveCompression?: boolean,
    segmentation?: boolean
}

/**
 * JavaScript String Compressor - compress function
 * @param str - Input string to compress
 * @returns Compressed string
 * @example
 * await compress('Hello, World!');
 * @since 1.0.0
 */
export function compress(str: string, options?: compressOptions): Promise<string>;
/**
 * JavaScript String Compressor - compress function
 * @param obj - Input object to compress
 * > **Note: it will `JSON.stringify()` your object so it may lose some data if your object has getters/setters/non-enumerables/etc.!**
 * @returns Compressed string
 * @example
 * await compress({a: "b"});
 * @since 2.0.0
 */
export function compress(obj: object, options?: compressOptions): Promise<string>;
/**
 * JavaScript String Compressor - compress function
 * @param int - Input integer to compress
 * @returns Compressed string
 * @example
 * await compress(10);
 * @since 2.0.0
 */
export function compress(int: number, options?: compressOptions): Promise<string>;

/**
 * JavaScript String Compressor - decompress function
 * @param str - Compressed string to decompress
 * @returns Decompressed string
 * @example
 * await decompress(compressedString);
 * @since 1.0.0
 */
export function decompress(str: string): Promise<string>;
/**
 * JavaScript String Compressor - decompress function
 * @param str - Compressed object to decompress
 * @param stringify - Always return string? (`JSON.stringify()` object outputs)
 * @returns Decompressed string
 * @example
 * await decompress(compressedString);
 * @since 2.0.0
 */
export function decompress(str: string, stringify?: boolean): Promise<object|string>;
/**
 * JavaScript String Compressor - decompress function
 * @param str - Compressed object to decompress
 * @param stringify - Always return string? (`.toString()` integer outputs)
 * @returns Decompressed string
 * @example
 * await decompress(compressedString);
 * @since 2.0.0
 */
export function decompress(str: string, stringify?: boolean): Promise<number|string>;

/**
 * JavaScript String Compressor
 * @license MIT
 * @copyright (c) 2025-2026 JustDeveloper <<https://justdeveloper.is-a.dev>>
 * @since 1.0.0
 */
declare const JSSC: {
    compress: typeof compress;
    decompress: typeof decompress;
    [Symbol.toStringTag]: 'JSSC';
};

export default JSSC;
