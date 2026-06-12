import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
