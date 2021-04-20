import { fromKeyLike } from 'jose/jwk/from_key_like';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

import { firestore } from './database';

if (!process.argv[2]) throw 'ERROR - Provide the email of the root user';

(async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  const publicKeyObject = crypto.createPublicKey({
    key: publicKey,
    format: 'pem',
    type: 'spki'
  });

  const jwk = await fromKeyLike(publicKeyObject);

  await Promise.all([
    firestore.doc(`users/${process.argv[2]}`).set({
      email: process.argv[2],
      name: 'Root',
      groups: ['root'],
      password: null,
      google: null,
      picture: null,
      created: new Date()
    }),
    firestore.doc(`configurations/private-key`).set({
      slug: 'private-key',
      value: privateKey
    }),
    firestore.doc(`configurations/public-key`).set({
      slug: 'public-key',
      value: JSON.stringify({ keys: [jwk] })
    }),
    firestore.doc(`configurations/allowed-origins`).set({
      slug: 'allowed-origins',
      value: `https://localhost:3000,https://localhost:8443`
    }),
    firestore.doc(`configurations/cookie-signature-keys`).set({
      slug: 'cookie-signature-keys',
      value: `${nanoid()},${nanoid()},${nanoid()},${nanoid()}`
    }),
    firestore.doc(`emails/sign-up`).set({
      slug: 'sign-up',
      subject: 'Luuk Accounts: Verify your e-mail address',
      text: 'Sign in by going to $linkURL',
      html: 'Sign in by going to <a href="$linkURL">$linkURL</a>'
    }),
    firestore.doc(`emails/forgot-password`).set({
      slug: 'forgot-password',
      subject: 'Luuk Accounts: Forgot Password',
      text: 'Sign in by going to $linkURL',
      html: 'Sign in by going to <a href="$linkURL">$linkURL</a>'
    }),
    firestore.doc(`emails/welcome`).set({
      slug: 'welcome',
      subject: 'Welcome to Luuk Accounts',
      text: 'Sign in by going to $linkURL',
      html: 'Sign in by going to <a href="$linkURL">$linkURL</a>'
    }),
    firestore.doc(`groups/root`).set({
      slug: 'root',
      permissions: ['administrator'],
      owner: 'administrator',
      parent: null,
      name: 'Administrators',
      created: new Date()
    })
  ]);
})();
