import pkg from "../package.json" with { type: "json" };
import * as sv from "semver";

export const name__ = 'JSSC';
export const prefix = name__+': ';
export const format = '.jssc';
export const fileprefix = new TextEncoder().encode(name__+'1');

export const version = pkg.version;
export const semver = new sv.SemVer(version);

export const repo = pkg.repository.url.slice(4,-4);
export const site = pkg.homepage;
