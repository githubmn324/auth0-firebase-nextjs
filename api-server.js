require('dotenv').config({ path: './.env.local' });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();
const port = process.env.API_PORT || 3001;
const baseUrl = process.env.AUTH0_BASE_URL;
const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const audience = process.env.AUTH0_AUDIENCE;

// ログ出力用
const pino = require('pino');
const expressPino = require('express-pino-logger');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

if (!baseUrl || !issuerBaseUrl) {
  throw new Error('Please make sure that the file .env.local is in place and populated');
}

if (!audience) {
  console.log('AUTH0_AUDIENCE not set in .env.local. Shutting down API server.');
  process.exit(1);
}

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: baseUrl }));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuerBaseUrl}/.well-known/jwks.json`,
  }),
  audience: audience,
  issuer: `${issuerBaseUrl}/`,
  algorithms: ['RS256']
});

app.get('/api/shows', checkJwt, (req, res) => {
  res.send({
    msg: 'Your access token was successfully validated!'
  });
});

const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./firebase/firebase-key');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

app.get('/api/firebase', checkJwt, async (req, res) => {
  console.log({
    method: "### /api/firebase",
  });
  // const {sub: uid} = req.user;
  const {sub: uid} = req.auth;
  console.log("### req.auth");
  console.dir(req.auth, { depth: null })
  console.log(`### req.auth: ${uid}`);
  
  const additionalClaims = {
    org_id: req.auth.org_id,
  };

  try {
      const firebaseToken = await firebaseAdmin.auth().createCustomToken(uid, additionalClaims);
      res.json({firebaseToken})
      console.log({
        firebaseToken: firebaseToken
      });
  } catch (err) {
      res.status(500).send({
      message: 'Firebase トークンを取得するときにエラーが発生しました。',
      error: err
      });
  }
});

const server = app.listen(port, () => console.log(`API Server listening on port ${port}`));
process.on('SIGINT', () => server.close());
