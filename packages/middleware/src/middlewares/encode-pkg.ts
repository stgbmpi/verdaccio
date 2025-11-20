import buildDebug from 'debug';

import { errorUtils } from '@verdaccio/core';

import { $NextFunctionVer, $RequestExtend, $ResponseExtend } from '../types';

const debug = buildDebug('verdaccio:middleware:encode');

/**
 * Encode / in a scoped package name to be matched as a single parameter in routes
 * @param req
 * @param res
 * @param next
 */
export function encodeScopePackage(
  req: $RequestExtend,
  res: $ResponseExtend,
  next: $NextFunctionVer
): void {
  const original = req.url;

  // Expect relative URLs i.e. should call makeURLrelative before this middleware
  if (!req.url.startsWith('/')) {
    return next(errorUtils.getBadRequest(`Invalid URL: ${req.url} (must be relative)`));
  }

  // Transform scoped package URLs to encode slash, making it a single path segment/parameter
  // Handles both encoded (%40) and unencoded (@) at-signs, and encoded (%2F) and unencoded (/) slashes
  // e.g.: /@org/pkg -> /@org%2Fpkg, /%40org/pkg -> /@org%2Fpkg
  //       /-/package/@org/pkg/dist-tags -> /-/package/@org%2Fpkg/dist-tags
  req.url = req.url.replace(
    /^(\/(?:-\/package\/)?)(?:@|%40)([^\/%]+)(?:\/|%2[fF])(?!$)/,
    '$1@$2%2F'
  );

  if (original !== req.url) {
    debug('encodeScopePackage: %o -> %o', original, req.url);
  } else {
    debug('encodeScopePackage: %o (unchanged)', original);
  }
  next();
}
