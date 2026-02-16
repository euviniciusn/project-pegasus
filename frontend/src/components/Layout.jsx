import PropTypes from 'prop-types';
import Navbar from './Navbar.jsx';

function Footer() {
  return (
    <footer className="py-6 text-center">
      <p className="text-xs text-neutral-400">
        Powered by <span className="font-medium text-neutral-500">Vecta Solutions</span>
      </p>
    </footer>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 flex flex-col py-6">
        <main className="flex-1 flex flex-col gap-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
