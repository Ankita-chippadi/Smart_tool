import React, { useState, useEffect } from 'react';

const RollingAverageControl = ({ onDataUpdate, chartData }) => {
  const [averageWindowSize, setAverageWindowSize] = useState(200); // Default window size
  const [selectedCalculation, setSelectedCalculation] = useState('average'); // Default calculation method
  const [isAveragingOn, setIsAveragingOn] = useState(false); // Default is off
  const [windowSize, setWindowSize] = useState(5); 
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleWindowSizeChange = (e) => {
    console.log("Input Change Event:", e.target.value);
    setWindowSize(e.target.value);
  };

  const handleCalculationChange = (e) => {
    console.log("Selected Calculation:", e.target.value); // Log the selected calculation
    setSelectedCalculation(e.target.value.toLowerCase());
  };
  const handleToggleAveraging = () => {
    setIsAveragingOn(!isAveragingOn);
    // Set buttonClicked to true when the button is clicked
    setButtonClicked(true);
  };


const calculateRollingAverage = (data, windowSize) => {
  const rollingAverages = [];

  for (let i = 0; i < data.length; i++) {
    const startIdx = Math.max(0, i - windowSize + 1);
    const endIdx = i + 1;
    const windowData = data.slice(startIdx, endIdx);

    let value;

    switch (selectedCalculation) {
      case 'average':
        value = windowData.reduce((sum, dataPoint) => sum + dataPoint.y, 0) / windowData.length;
        break;
      case 'mean':
        value = windowData.reduce((sum, dataPoint) => sum + dataPoint.y, 0) / windowData.length;
        break;
      case 'median':
        // Calculate median
        const sortedWindowData = windowData.map((dataPoint) => dataPoint.y).sort((a, b) => a - b);
        const middle = Math.floor(sortedWindowData.length / 2);

        if (sortedWindowData.length % 2 === 0) {
          value = (sortedWindowData[middle - 1] + sortedWindowData[middle]) / 2;
        } else {
          value = sortedWindowData[middle];
        }
        break;
      default:
        value = 0;
    }

    rollingAverages.push({ x: data[i].x, y: value });
  }

  return rollingAverages;
};

useEffect(() => {
  console.log("Inside useEffect");
  console.log("isAveragingOn:", isAveragingOn);
  console.log("chartData:", chartData);
  console.log("averageWindowSize:", averageWindowSize);
  console.log("selectedCalculation:", selectedCalculation);

  if (buttonClicked && isAveragingOn && chartData && chartData.length > 0) {
    const rollingAverages = calculateRollingAverage(chartData, averageWindowSize);
    onDataUpdate(rollingAverages);

    // Reset buttonClicked state to false after the calculation
    setButtonClicked(false);
  }
}, [buttonClicked, isAveragingOn, averageWindowSize, chartData, onDataUpdate, selectedCalculation]);

    // Toggle averaging on when the component mounts
    useEffect(() => {
      
        setIsAveragingOn(false);
      }, []); // Empty dependency array ensures this effect runs only once on mount
    
  
  
  return (
    <div className="bg-gray-300 p-4 rounded-md mb-4">
      <label htmlFor="averageWindowSize" className="block text-gray-700">points for average:</label>
      <input
  type="number"
  id="averageWindowSize"
  value={averageWindowSize}
  onChange={handleWindowSizeChange}
  className="mt-1 p-2 border rounded-md w-full"
/>

      <label htmlFor="calculationMethod" className="block text-gray-700 mt-4">Select type:</label>
      <select
  id="calculationMethod"
  value={selectedCalculation}
  onChange={handleCalculationChange}
  className="mt-1 p-2 border rounded-md w-full"
>
        <option value="average">Average</option>
        <option value="mean">mean</option>
        <option value="median">median</option>
        {/* Add options for other calculations (mean, median) if needed */}
      </select>

      <button
        onClick={handleToggleAveraging}
        className="mt-4 bg-gray-600 text-white p-2 rounded-md"
      >
        {isAveragingOn ? 'Turn Off Averaging' : 'Turn On Averaging'}
      </button>
    </div>
  );
};

export default RollingAverageControl;
