/**
 * Optional Worker on thebidboard.lol.
 * OG/Twitter cards now use the static file at /og.png — this worker
 * must not rewrite meta tags to the old dynamic API image.
 *
 * Deploy after this change so crawlers stop hitting /api/og-image.png:
 *   cd edge && wrangler deploy
 */

export default {
  async fetch(request) {
    return fetch(request);
  },
};
