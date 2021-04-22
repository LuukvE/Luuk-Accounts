import sendgrid from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

import { User, Group, SignInResponse } from './types';
import { getConfiguration, getEmail, findGroups } from './database';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export const mail = async (
  slug: string,
  email: string,
  linkURL: string
): Promise<{ error: null | any; success: boolean }> => {
  const to = email;
  const template = await getEmail(slug);
  const subject = template.subject;
  const text = template.text.replace(/\$linkURL/g, linkURL);
  const html = template.html.replace(/\$linkURL/g, linkURL);
  try {
    await sendgrid.send({
      to,
      from: 'no-reply@luuk.gg',
      subject,
      text,
      html
    });
  } catch (error) {
    console.error(error);

    return {
      error: error.response,
      success: false
    };
  }

  return {
    error: null,
    success: true
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const passwordMatches = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateJWT = async (response: SignInResponse): Promise<string> => {
  const configuration = await getConfiguration('private-key');

  return new Promise<string>((resolve) => {
    jwt.sign(
      response,
      configuration.value,
      { expiresIn: '3h', algorithm: 'RS256' },
      (err, signed) => {
        if (err) console.log('jwt generation failed', err);

        resolve(signed || '');
      }
    );
  });
};

export const getAllGroups = async () => {
  const groups = await findGroups();

  return groups.reduce((groups: { [slug: string]: Group }, group: Group) => {
    groups[group.slug] = group;

    return groups;
  }, {});
};

export const getPermissions = async (user: User, groups: { [slug: string]: Group }) => {
  const reducer = (permissions: string[], slug: string): string[] => {
    const group = groups[slug];

    group.permissions.forEach((permission) => {
      if (!permissions.includes(permission)) permissions.push(permission);
    });

    const children = Object.values(groups).reduce((children: string[], child: Group) => {
      if (child.parent === group.slug) children.push(child.slug);

      return children;
    }, []);

    return children.reduce(reducer, permissions);
  };

  return user.groups.reduce(reducer, []);
};

// Find all groups that have an owner permission that is part of thisUser permissions and their children (ownedGroups)
export const getOwnedGroups = async (user: User): Promise<Group[]> => {
  const groups = await getAllGroups();

  const permissions = await getPermissions(user, groups);

  const reducer = (ownedGroups: string[], slug: string): string[] => {
    const group = groups[slug];

    if (!ownedGroups.includes(slug)) ownedGroups.push(slug);

    const children = Object.values(groups).reduce((children: string[], child: Group) => {
      if (child.parent === group.slug) children.push(child.slug);

      return children;
    }, []);

    return children.reduce(reducer, ownedGroups);
  };

  return Object.values(groups)
    .filter((group) => permissions.includes(group.owner))
    .map((group) => group.slug)
    .reduce(reducer, [])
    .map((slug) => groups[slug]);
};
