// ViewBounds.js
import React from 'react';

const ViewBounds = ({ onBoundsChange }) => {
  // Logic for ViewBounds component

  return (
    <div>
      {/* Add your JSX content for ViewBounds */}
      <label>Start Bound:</label>
      <input type="text" onChange={(e) => onBoundsChange({ start: e.target.value, end: null })} />

      <label>End Bound:</label>
      <input type="text" onChange={(e) => onBoundsChange({ start: null, end: e.target.value })} />
    </div>
  );
};

export default ViewBounds;
