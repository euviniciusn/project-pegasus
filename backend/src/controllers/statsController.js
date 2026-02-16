import * as statsService from '../services/statsService.js';

export async function getStats(request, reply) {
  const stats = await statsService.getStats();

  return reply.send({
    success: true,
    data: stats,
  });
}
