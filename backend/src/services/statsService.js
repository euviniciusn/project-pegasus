import * as statsRepo from '../repositories/statsRepository.js';

export async function getStats() {
  const [conversions, bytes, formats, hourly, errorRate] = await Promise.all([
    statsRepo.getConversionCounts(),
    statsRepo.getBytesProcessed(),
    statsRepo.getFormatDistribution(),
    statsRepo.getHourlyConversions(),
    statsRepo.getErrorRate(),
  ]);

  return {
    conversions,
    bytes,
    formats,
    hourly,
    errorRate,
  };
}
