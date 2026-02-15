import crypto from 'node:crypto';
import fp from 'fastify-plugin';
import config from '../config/index.js';

const COOKIE_NAME = 'session_token';

function sessionPlugin(fastify, _opts, done) {
  fastify.decorateRequest('sessionToken', null);

  fastify.addHook('onRequest', (request, reply, hookDone) => {
    let token = request.cookies[COOKIE_NAME];

    if (!token) {
      token = crypto.randomUUID();
      reply.setCookie(COOKIE_NAME, token, {
        path: '/',
        httpOnly: true,
        secure: config.server.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: config.session.ttl,
      });
    }

    request.sessionToken = token;
    hookDone();
  });

  done();
}

export default fp(sessionPlugin, { name: 'session' });
