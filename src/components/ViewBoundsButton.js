import React from 'react';

const ViewBoundButton = ({ onViewBoundsClick }) => {
  return (
    <button onClick={onViewBoundsClick} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer mt-4">
      View Bounds
    </button>
  );
};

export default ViewBoundButton;