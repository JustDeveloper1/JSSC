import pkg from "../package.json" with { type: "json" };
import { SemVer } from "semver";

export const name__ = 'JSSC';
export const prefix = name__+': ';
export const format = '.jssc';
export const fileprefix = new TextEncoder().encode(name__+'1');

export const version = pkg.version;
export const semver = new SemVer(version);
