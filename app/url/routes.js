const router = require('express').Router();
const url = require('./url');


router.get('/:hash', async (req, res, next) => {

  const data = await url.getUrl(req.params.hash);

  // TODO: Respond accordingly when the hash wasn't found (404 maybe?)
  // DONE: If data is null stop the code execution and send a message with status code 404
  if (!data) {
    return res.status(404).end('URL not found');
  }

  // TODO: Hide fields that shouldn't be public
  // DONE: Create a new object with the response public data
  const source = {
    url: data.url,
    protocol: data.protocol,
    domain: data.domain,
    path: data.path
  }

  // TODO: Register visit
  // DONE: New method created to update the visit
  const visit = await url.registerVisit(data.hash);

  // Behave based on the requested format using the 'Accept' header.
  // If header is not provided or is */* redirect instead.
  const accepts = req.get('Accept');

  switch (accepts) {
    case 'text/plain':
      res.end(source.url);
      break;
    case 'application/json':
      res.json(source);
      break;
    default:
      res.redirect(source.url);
      break;
  }
});


router.post('/', async (req, res, next) => {

  // TODO: Validate 'req.body.url' presence
  // DONE: If 'req.body.url' doesn't exist stop the code execution and send a message with status code 400
  if (!req.body.url) {
    return res.status(400).json({ message: 'Missing URL' });
  }

  try {
    let shortUrl = await url.shorten(req.body.url, url.generateHash(req.body.url));
    res.json(shortUrl);
  } catch (e) {
    // TODO: Personalized Error Messages
    // DONE: Send a custom error message with status code 500
    res.status(500).json({ message: 'Error. URL was not saved', details: e.message });
    next(e);
  }
});


router.delete('/:hash/remove/:removeToken', async (req, res, next) => {
  // TODO: Remove shortened URL if the remove token and the hash match
  // DONE: Created the function and code required to remove the URL
  if (!req.params.hash || !req.params.removeToken) {
    return res.status(400).json({ message: 'Missing hash or token' });
  }

  try {
    let remove = await url.removeUrl(req.params.hash, req.params.removeToken);
    res.json({ message: 'URL removed' });
  } catch (e) {
    res.status(500).json({ message: 'Error. URL was not removed', details: e.message });
    next(e);
  }
});

module.exports = router;
