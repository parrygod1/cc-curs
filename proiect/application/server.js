process.env.GOOGLE_APPLICATION_CREDENTIALS =
  'credentials/disco-dispatch-307814-e2b5024e384a.json';
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config({ path: './.env' });
const {
  insertProd,
  delProd,
  getProducts,
  insertList,
  delBucket,
  updatePremiumStatus,
  getLists,
  getSingleProduct,
  getSingleList,
  updateFavorites,
  getFavorites,
  getUserData,
  addUser,
} = require('./utils');

const app = express();
const port = 8080;
app.set('view engine', 'ejs');
app.set('views', './app');
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/product/:productId', (req, res) => {
  res.render('product');
});
app.get('/favorites/', (req, res) => {
  res.render('favorites');
});

app.get('/lists/', (req, res) => {
  res.render('productlists');
});

app.get('/list/:listId', (req, res) => {
  res.render('list');
});

app.use(express.static('app', { root: __dirname }));
app.use(express.static('app/stripe', { root: __dirname }));
app.use(express.json());

//http://localhost:8080/buypremium
app.get('/buypremium', (req, res) => {
  res.sendFile('/app/stripe/index.html', { root: __dirname });
});

app.post('/addUser', (req, res) => {
  if (req.body.UserId || req.query.UserId) {
    addUser(req.body.UserId || req.query.UserId).then(
      () => res.send('')
    );
  }
  else {
    res.status(400).send({ message: 'Bad request, invalid parameters' });
  }
});

app.post('/updateFavorites', (req, res) => {
  updateFavorites(req.body.UserId, req.body.ProductId, req.body.Token).then(
    () => res.send('')
  );
});

app.get('/getFavorites', (req, res) => {
  getFavorites(
    req.body.UserId || req.query.UserId,
    req.body.Token || req.query.Token
  ).then(async (data) => res.send(data));
});

app.get('/getLists', (req, res) => {
  if (
    (req.body.userid || req.query.userid) &&
    (req.body.token || req.query.token)
  ) {
    getLists(
      req.body.userid || req.query.userid,
      req.body.token || req.query.token
    ).then(async (data) => res.send(data));
  } else {
    res.status(400).send({ message: 'Bad request, invalid parameters' });
  }
});

app.get('/getSingleList', (req, res) => {
  if (req.param('userid') && req.param('listid')) {
    getSingleList(
      req.body.userid || req.query.userid,
      req.body.listid || req.query.listid
    ).then(async (data) => res.send(await data));
  } else {
    res.status(400).send({ message: 'Bad request, invalid parameters' });
  }
});

app.get('/products/:productid', async (req, res) => {
  res.send(await getSingleProduct(req.params.productid));
});

//http://localhost:8080/getProducts
app.get('/products', async (req, res) => {
  const { search } = req.query;
  res.send(await getProducts(search));
});

app.post('/insertList', (req, res) => {
  insertList(
    req.body['UserId'],
    req.body['ProductIds'],
    req.body['ListName']
  ).then(res.send({ message: 'OK' }));
});

app.post('/products', async (req, res) => {
  await delBucket();
  for (let store of ['lidl', 'profi', 'kaufland']) {
    const response = await fetch(
      `https://europe-west1-disco-dispatch-307814.cloudfunctions.net/scrapProducts?store=${store}`
    );
    const prod = await response.json();
    await delProd(store);
    await insertProd(prod, store);
  }
  res.status(200).json({ msg: 'Products updated' });
});

app.get('/getDirections', (req, res) => {
  let url =
    'https://europe-west1-disco-dispatch-307814.cloudfunctions.net' + req.url;
  fetch(url).then(async (response) => res.send(await response.text()));
});

app.get('/checkPremium', (req, res) => {
  if (req.body.userid || req.query.userid) {
    getUserData(req.body.userid || req.query.userid).then(async (data) =>
      res.send(await data)
    );
  } else {
    res.status(400).send({ message: 'Bad request, invalid parameters' });
  }
});

/*====Stripe API====*/

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
  appInfo: {
    // For sample support and debugging, not required for production:
    name: 'stripe-samples/checkout-one-time-payments',
    version: '0.0.1',
    url: 'https://github.com/stripe-samples/checkout-one-time-payments',
  },
});

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get('/config', async (req, res) => {
  const price = await stripe.prices.retrieve(process.env.PRICE);

  res.send({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    unitAmount: price.unit_amount,
    currency: price.currency,
  });
});

// Fetch the Checkout Session to display the JSON result on the success page
app.get('/checkout-session', async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

app.post('/create-checkout-session', async (req, res) => {
  const domainURL = process.env.DOMAIN;

  const { quantity, userid, locale } = req.body;

  // The list of supported payment method types. We fetch this from the
  // environment variables in this sample. In practice, users often hard code a
  // list of strings for the payment method types they plan to support.
  const pmTypes = (process.env.PAYMENT_METHOD_TYPES || 'card')
    .split(',')
    .map((m) => m.trim());

  // Create new Checkout Session for the order
  // Other optional params include:
  // [billing_address_collection] - to display billing address details on the page
  // [customer] - if you have an existing Stripe Customer ID
  // [customer_email] - lets you prefill the email input in the Checkout page
  // For full details see https://stripe.com/docs/api/checkout/sessions/create
  const session = await stripe.checkout.sessions.create({
    payment_method_types: pmTypes,
    mode: 'payment',
    locale: locale,
    line_items: [
      {
        price: process.env.PRICE,
        quantity: quantity,
      },
    ],
    // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
    success_url: `${domainURL}/stripe/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainURL}/stripe/canceled.html`,
    metadata: {
      userid: userid,
    },
  });

  res.send({
    sessionId: session.id,
  });
});

// Webhook handler for asynchronous events.
app.post('/webhook', async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'checkout.session.completed') {
    console.log(`🔔  Payment received!`);
    //updatePremiumStatus('ZOoxAxMB71SjEDHpdJ42hKqZIDi1', 1);
    updatePremiumStatus(data['object']['metadata']['userid'], 1);
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
