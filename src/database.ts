import { QuerySnapshot } from '@google-cloud/firestore';
import { credential, initializeApp, ServiceAccount } from 'firebase-admin';

import service from '../google-service.json';

import {
  User,
  Session,
  Group,
  Permission,
  Link,
  Log,
  Email,
  Configuration,
  LoadResponse
} from './types';

const firestore = initializeApp({
  credential: credential.cert(service as ServiceAccount)
}).firestore();

export const getUser = async (email: string): Promise<User | null> => {
  const document = firestore.doc(`users/${email}`);
  const snapshot = await document.get();
  const user = snapshot.data();

  if (!user) return null;

  return { ...user, created: user.created.toDate() } as User;
};

export const getSession = async (id: string): Promise<Session | null> => {
  const document = firestore.doc(`sessions/${id}`);
  const snapshot = await document.get();
  const session = snapshot.data();

  if (!session) return null;

  return {
    ...session,
    expired: session.expired?.toDate() || null,
    created: session.created.toDate()
  } as Session;
};

export const getLink = async (id: string): Promise<Link | null> => {
  const document = firestore.doc(`links/${id}`);
  const snapshot = await document.get();
  const link = snapshot.data();

  if (!link) return null;

  return { ...link, created: link.created.toDate() } as Link;
};

export const getGroup = async (slug: string): Promise<Group | null> => {
  const document = firestore.doc(`groups/${slug}`);
  const snapshot = await document.get();
  const group = snapshot.data();

  if (!group) return null;

  return { ...group, created: group.created.toDate() } as Group;
};

export const saveUser = async (user: User): Promise<User> => {
  const document = firestore.doc(`users/${user.email}`);

  await document.set(user, { merge: true });

  const snapshot = await document.get();

  const update = snapshot.data();

  return { ...update, created: update.created.toDate() } as User;
};

export const saveSession = async (session: Session): Promise<Session> => {
  const document = firestore.doc(`sessions/${session.id}`);

  await document.set(session, { merge: true });

  const snapshot = await document.get();

  const update = snapshot.data();

  return {
    ...update,
    expired: update.expired?.toDate() || null,
    created: update.created.toDate()
  } as Session;
};

export const saveLink = async (link: Link): Promise<Link> => {
  const document = firestore.doc(`links/${link.id}`);

  await document.set(link, { merge: true });

  const snapshot = await document.get();

  const update = snapshot.data();

  return { ...update, created: update.created.toDate() } as Link;
};

export const saveGroup = async (group: Group): Promise<Group> => {
  const document = firestore.doc(`groups/${group.slug}`);

  await document.set(group, { merge: true });

  const snapshot = await document.get();

  const update = snapshot.data();

  return { ...update, created: update.created.toDate() } as Group;
};

export const getUsersInGroups = async (groups: Group[]): Promise<User[]> => {
  const collection = firestore.collection('users');
  const users: { [email: string]: User } = {};
  const slugs = groups.map((group) => group.slug);
  const snapshot: QuerySnapshot = await collection
    .where('groups', 'array-contains-any', slugs)
    .get();

  snapshot.forEach((doc) => {
    const user = doc.data();

    users[user.email] = user as User;
  });

  return Object.values(users);
};

export const findSessions = async (filter: {
  [key: string]: string | null;
}): Promise<Session[]> => {
  const results: Session[] = [];
  const query = Object.keys(filter).reduce(
    (query: any, key) => query.where(key, '==', filter[key]),
    firestore.collection('sessions')
  );

  const snapshot: QuerySnapshot = await query.get();

  snapshot.forEach((doc) => {
    const session = doc.data();

    results.push({
      ...session,
      expired: session.expired?.toDate() || null,
      created: session.created.toDate()
    } as Session);
  });

  return results;
};

export const findGroups = async (filter?: { [key: string]: string | null }): Promise<Group[]> => {
  const results: Group[] = [];
  const query = Object.keys(filter || {}).reduce(
    (query: any, key) => query.where(key, '==', filter[key]),
    firestore.collection('groups')
  );

  const snapshot: QuerySnapshot = await query.get();

  snapshot.forEach((doc) => {
    const group = doc.data();

    results.push({
      ...group,
      created: group.created.toDate()
    } as Group);
  });

  return results;
};

export const getAll = async (): Promise<LoadResponse> => {
  const response: LoadResponse = {
    type: 'load',
    groups: [],
    users: [],
    permissions: [],
    sessions: [],
    links: [],
    logs: [],
    emails: [],
    configurations: []
  };

  const { type, groups, users, ...collections } = response;

  await Promise.all(
    Object.keys(collections).map(
      (collection) =>
        new Promise(async (resolve) => {
          let query: any = firestore.collection(collection);

          if (['sessions', 'links'].includes(collection)) {
            query = query.where('expired', '==', null);
          }

          const snapshot: QuerySnapshot = await query.get();

          snapshot.forEach((doc) => {
            let data = doc.data();

            if (data.created) data.created = data.created.toDate();

            response[collection].push(data);
          });

          resolve(null);
        })
    )
  );

  return response;
};
