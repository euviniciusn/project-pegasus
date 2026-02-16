import PropTypes from 'prop-types';

function ButtonContent({ isProcessing, isCompleted }) {
  if (isProcessing) {
    return (
      <span className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Processando...
      </span>
    );
  }

  if (isCompleted) return 'Converter novamente';

  return 'Converter';
}

ButtonContent.propTypes = {
  isProcessing: PropTypes.bool.isRequired,
  isCompleted: PropTypes.bool.isRequired,
};

export default function ConvertButton({ onClick, isDisabled, isProcessing, isCompleted }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled || isProcessing}
      className={`
        w-full inline-flex items-center justify-center
        px-6 py-3 rounded-full text-base font-semibold
        transition-all duration-300
        ${isDisabled || isProcessing
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-[1.02] shadow-sm hover:shadow-md'}
      `}
    >
      <ButtonContent isProcessing={isProcessing} isCompleted={isCompleted} />
    </button>
  );
}

ConvertButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  isCompleted: PropTypes.bool.isRequired,
};
