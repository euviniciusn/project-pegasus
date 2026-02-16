import PropTypes from 'prop-types';

export default function UsageBanner({ remaining, max }) {
  if (remaining === null || remaining > 5) return null;

  const isExhausted = remaining <= 0;

  return (
    <div className={`
      rounded-xl px-4 py-3 text-sm font-medium text-center
      ${isExhausted
        ? 'bg-red-50 text-red-700 border border-red-200'
        : 'bg-amber-50 text-amber-700 border border-amber-200'}
    `}>
      {isExhausted
        ? `Você atingiu o limite de ${max} conversões por dia. Tente novamente amanhã.`
        : `Restam ${remaining} conversão${remaining !== 1 ? 'ões' : ''} hoje`}
    </div>
  );
}

UsageBanner.propTypes = {
  remaining: PropTypes.number,
  max: PropTypes.number,
};
