import { name__, version } from './meta.js';
import * as sv from "semver";

export const semver = new sv.SemVer(version);
export const fileprefix = new TextEncoder().encode(name__+'1');
