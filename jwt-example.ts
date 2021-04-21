import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = jwksRsa({
  jwksUri: 'https://localhost:8443/api/public-key.json'
});

const token = ''; // Copy from `token` property inside a sign-in server response

jwt.verify(
  token,
  (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);

      callback(null, key.getPublicKey());
    });
  },
  { algorithms: ['RS256'] },
  (err, user) => {
    if (err) throw err;

    console.log(user);
  }
);
