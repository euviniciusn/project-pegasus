import * as usageLimitService from '../services/usageLimitService.js';

export async function getLimits(request, reply) {
  const limits = await usageLimitService.getLimits(request.sessionToken);

  return reply.send({
    success: true,
    data: limits,
  });
}
