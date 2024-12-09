export interface Claims {
  username: string;
  admin: boolean;
}

type JWTClaims = {
  email?: string;
  scopes?: string;
  'cognito:groups'?: string[];
}

export function claimsFrom(event: any): Claims | undefined {
  const claims: JWTClaims | undefined =  event.requestContext?.authorizer?.claims
  if (claims) {
    const username = claims.email ?? 'unknown';
    console.log(
      `Discovered user ${username} has cognito groups ${
        claims['cognito:groups'] ?? []
      }`,
    );
    return {
      username,
      admin: (claims['cognito:groups'] ?? []).includes('administrators'),
    };
  }
  console.warn('No claims could be found');
  return undefined;
}

export function authorized<
  E extends (event: any, ...rest: any) => Promise<any>,
>(handler: (claims: Claims) => E): E {
  return (async (event: any, ...rest: any) => {
    const claims = claimsFrom(event);
    if (!claims) return { statusCode: 403, body: 'Access Denied' };
    return (handler(claims) as any)(event, ...rest);
  }) as any;
}
