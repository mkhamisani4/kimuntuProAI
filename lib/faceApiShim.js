'use client';

/**
 * Re-export face-api.js so that dynamic import() resolves to this file.
 * Next then bundles this + the aliased CommonJS build, avoiding the 404
 * for the package's es6 chunk.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as faceApiNamespace from 'face-api.js';
// CJS module may not have default; use namespace so .nets is always available
const faceApi = faceApiNamespace.default && faceApiNamespace.default.nets
  ? faceApiNamespace.default
  : faceApiNamespace;
export default faceApi;
