const shortid = require('shortid');
const { domain } = require('../../environment');
const SERVER = `${domain.protocol}://${domain.host}`;

const UrlModel = require('./schema');
const parseUrl = require('url').parse;
const validUrl = require('valid-url');

/**
 * Lookup for existant, active shortened URLs by hash.
 * 'null' will be returned when no matches were found.
 * @param {string} hash
 * @returns {object}
 */
async function getUrl(hash) {
  let source = await UrlModel.findOne({ active: true, hash });
  return source;
}

/**
 * Generate an unique hash-ish- for an URL.
 * TODO: Deprecated the use of UUIDs.
 * TODO: Implement a shortening algorithm.
 * DONE: Replacing UUID library for shortid library solved the shortening
 * @param {string} id
 * @returns {string} hash
 */
function generateHash(url) {
  return shortid.generate();
}

/**
 * Generate a random token that will allow URLs to be (logical) removed
 * @returns {string} hash
 */
function generateRemoveToken() {
  return shortid.generate();
}

/**
 * Create an instance of a shortened URL in the DB.
 * Parse the URL destructuring into base components (Protocol, Host, Path).
 * An Error will be thrown if the URL is not valid or saving fails.
 * @param {string} url
 * @param {string} hash
 * @returns {object}
 */
async function shorten(url, hash) {

  if (!isValid(url)) {
    throw new Error('Invalid URL');
  }

  // Get URL components for metrics sake
  const urlComponents = parseUrl(url);
  const protocol = urlComponents.protocol || '';
  const domain = `${urlComponents.host || ''}${urlComponents.auth || ''}`;
  const path = `${urlComponents.path || ''}${urlComponents.hash || ''}`;

  // Generate a token that will alow an URL to be removed (logical)
  const removeToken = generateRemoveToken();

  // Create a new model instance
  const shortUrl = new UrlModel({
    url,
    protocol,
    domain,
    path,
    hash,
    isCustom: false,
    removeToken,
    active: true,
    visits: 0
  });

  const saved = await shortUrl.save();
  // TODO: Handle save errors
  // TRY and CATCH in the POST route is handling the errors.
  /* Also, we can add the following callback in the save method to handle errors:
      const saved = await shortUrl.save((err) => {  
        if (err) {
          res.status(500).send(err);
        }
      });
  */

  return {
    url,
    shorten: `${SERVER}/${hash}`,
    hash,
    removeUrl: `${SERVER}/${hash}/remove/${removeToken}`
  };

}

/**
 * Validate URI
 * @param {any} hash
 * @returns {boolean}
 */
function isValid(url) {
  return validUrl.isUri(url);
}

/**
 * Register visit
 * @param {string} hash
 * @returns {object}
 */
async function registerVisit(hash) {
  let updated = await UrlModel.update({ hash }, { $inc: { visits: 1 } });
  return updated;
}

/**
 * Remove URL
 * @param {string} hash
 * @param {string} removeToken
 * @returns {object}
 */
async function removeUrl(hash, removeToken) {
  let removed = await UrlModel.remove({ hash, removeToken });
  return removed;
}

module.exports = {
  shorten,
  getUrl,
  generateHash,
  generateRemoveToken,
  isValid,
  registerVisit,
  removeUrl
}
