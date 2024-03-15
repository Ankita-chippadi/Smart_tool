import React, { useState, useEffect } from 'react';

const ColumnFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    tension: true,
    torsion: true,
    bendingMomentY: true,
    temperature: true,
  });

  const handleFilterChange = (columnName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [columnName]: !prevFilters[columnName],
    }));
  };

  // Notify the parent component about the filter changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <div className="flex flex-col space-y-4" style={{ position: 'relative', left: '70%',top:'10%',width:'230px' }}>
      <p style={{fontFamily:'monospace_bold',fontSize:'20px'}}>Display</p>
    <table className="table-auto border border-collapse min-w-min">
      <thead>
        <tr>
          <th className="px-4 py-2 border-b">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={filters.tension}
                onChange={() => handleFilterChange('tension')}
              />
              <span className="ml-2">Tension</span>
            </label>
          </th>
        </tr>
        <tr>
          <th className="px-4 py-2 border-b">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={filters.torsion}
                onChange={() => handleFilterChange('torsion')}
              />
              <span className="ml-2">Torsion</span>
            </label>
          </th>
        </tr>
        <tr>
          <th className="px-4 py-2 border-b">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={filters.bendingMomentY}
                onChange={() => handleFilterChange('bendingMomentY')}
              />
              <span className="ml-2">Bending Moment Y</span>
            </label>
          </th>
        </tr>
        <tr>
          <th className="px-4 py-2 border-b">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={filters.temperature}
                onChange={() => handleFilterChange('temperature')}
              />
              <span className="ml-2">Temperature</span>
            </label>
          </th>
        </tr>
      </thead>
    </table>
  </div>
  
  );
};

export default ColumnFilter;
