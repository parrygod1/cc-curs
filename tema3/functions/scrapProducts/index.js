const { lidl, profi, kaufland } = require('./scrape');
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.scrapProducts = async (req, res) => {
  const { store } = req.query;
  if (!store) {
    res.status(500).send('Please specify store');
    return;
  }
  let data;
  if (store === 'lidl') {
    data = await lidl();
  } else if (store === 'profi') {
    data = await profi();
  } else if (store === 'kaufland') {
    data = await kaufland();
  }
  res.status(200).json(data);
};
