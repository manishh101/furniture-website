import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-6">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">Page Not Found</h2>
        <p className="text-lg text-text/80 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="btn btn-primary inline-block">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
