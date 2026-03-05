import pkg from "../package.json" with { type: "json" };

export const name__ = 'JSSC';
export const prefix = name__+': ';
export const format = '.jssc';
export const type = name__+'1';

export const version = pkg.version;

export const repo = pkg.repository.url.slice(4,-4);
export const site = pkg.homepage;
