// CompareValuesButton.js

import React, { useState } from 'react';

const CompareValuesButton = ({ onCompareClick }) => {
  const handleClick = () => {
    onCompareClick();
  };

  return (
    <button
      onClick={handleClick}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer mt-4" 
     >
      Compare Values
    </button>
  );
};

export default CompareValuesButton;
