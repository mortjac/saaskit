// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  createUser,
  deleteUserBySession,
  getUser,
  newUserProps,
  updateUser,
  type User,
} from "@/utils/db.ts";
import { stripe } from "@/utils/payments.ts";
import { handleCallback } from "kv_oauth";
import { oauth2Client } from "@/utils/oauth2_client.ts";
import {
  deleteRedirectUrlCookie,
  getRedirectUrlCookie,
} from "@/utils/redirect.ts";

interface GitHubUser {
  id: number;
  login: string;
  email: string;
}

async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error();
  }
  return await response.json() as GitHubUser;
}

export default async function CallbackPage(req: Request) {
  const { response, accessToken, sessionId } = await handleCallback(
    req,
    oauth2Client,
    getRedirectUrlCookie(req.headers),
  );

  deleteRedirectUrlCookie(response.headers);

  const githubUser = await getGitHubUser(accessToken);

  const user = await getUser(githubUser.id.toString());
  if (!user) {
    let stripeCustomerId = undefined;
    if (stripe) {
      const customer = await stripe.customers.create({
        email: githubUser.email,
      });
      stripeCustomerId = customer.id;
    }
    const user: User = {
      id: githubUser.id.toString(),
      login: githubUser.login,
      stripeCustomerId,
      sessionId,
      ...newUserProps(),
    };
    await createUser(user);
  } else {
    await deleteUserBySession(sessionId);
    await updateUser({ ...user, sessionId });
  }
  return response;
}
