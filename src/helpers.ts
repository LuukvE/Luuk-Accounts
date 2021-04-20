import sendgrid from '@sendgrid/mail';
import dotenv from 'dotenv';
import path from 'path';

import { User, Group } from './types';
import { findGroups } from './database';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export const mail = async (
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<{ error: null | any; success: boolean }> => {
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

export const mailSignup = async (email: string, linkURL: string) => {
  return mail(
    email,
    'SignOn: Verify your E-mail address',
    `Sign in by going to ${linkURL}`,
    `Sign in by going to <a href="${linkURL}">${linkURL}</a>`
  );
};

export const mailForgotPassword = async (email: string, linkURL: string) => {
  return mail(
    email,
    'SignOn: Forgot Password',
    `Sign in by going to ${linkURL}`,
    `Sign in by going to <a href="${linkURL}">${linkURL}</a>`
  );
};

export const mailWelcome = async (email: string, linkURL: string) => {
  return mail(
    email,
    'Welcome to SignOn',
    `Sign in by going to ${linkURL}`,
    `Sign in by going to <a href="${linkURL}">${linkURL}</a>`
  );
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
