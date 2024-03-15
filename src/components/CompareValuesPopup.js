import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import 'tailwindcss/tailwind.css';

const CompareValuesPopup = ({ onClose, selectedRecords, onCompare }) => {
  const [selectedYAxis, setSelectedYAxis] = useState('Tension');
  const [chartData, setChartData] = useState([]);
  const [averageValue, setAverageValue] = useState('');
  const numXTicks = 20;
  const numYTicks = 25;

  useEffect(() => {
    const parseData = (rawData) => {
      const lines = rawData.split('\n');
      const headers = lines[0].split(';').map(header => header.trim());

      return lines.slice(2).map((line, lineIndex) => {
        const values = line.split(';').map(value => value.trim()).filter(value => value !== '');
        const record = {};

        headers.forEach((header, index) => {
          const [key, propertyValue] = values[index].split(':').map(value => value.trim());
          const adjustedKey = key === 'Bending moment Y' ? 'Bending Moment Y' : key;

          if (adjustedKey === 'Tension' || adjustedKey === 'Torsion' || adjustedKey === 'Bending Moment Y' || adjustedKey === 'Temperature') {
            const numericValue = propertyValue !== undefined ? parseFloat(propertyValue) : undefined;
            record[adjustedKey] = isNaN(numericValue) ? undefined : numericValue;
          } else {
            record[adjustedKey] = propertyValue;
          }
        });

        if (Object.keys(record).length !== headers.length) {
          console.error(`Error parsing data at line ${lineIndex + 3}. Expected ${headers.length} columns, got ${Object.keys(record).length}. Data:`, line);
        }

        console.log('Parsed Record:', record);
        return record;
      });
    };

    const fetchData = () => {
      if (!selectedRecords || selectedRecords.length === 0) {
        setChartData([]);
        return;
      }

      const mergedSeriesData = [];

      selectedRecords.forEach((record) => {
        if (!record.data) {
          return;
        }

        const parsedData = parseData(record.data);
        console.log('Number of Rows:', parsedData.length);

        const seriesData = parsedData.map((row) => {
          const time = Number(row.Time);
          const yValue = parseFloat(row[selectedYAxis]);

          if (isNaN(time) || isNaN(yValue)) {
            console.log(`Invalid data for ${selectedYAxis} at record ${record.fileName}: Time=${row.Time}, ${selectedYAxis}=${row[selectedYAxis]}`);
            return null;
          }

          return [time, yValue];
        }).filter((data) => data !== null);

        console.log('Series Data for', record.fileName, seriesData);

        mergedSeriesData.push({
          name: record.fileName,
          data: seriesData,
        });
      });

      console.log('Merged Series Data:', mergedSeriesData);

      setChartData(mergedSeriesData);
    };

    fetchData();
  }, [selectedRecords, selectedYAxis]);

  const handleCompare = () => {
    onCompare(selectedYAxis);
  };

  const handleAverageChange = (event) => {
    const newValue = event.target.value.replace(/\D/, ''); // Remove non-numeric characters
    setAverageValue(newValue);
  };

  const handleIncrease = () => {
    setAverageValue((prevValue) => String(Number(prevValue) + 1));
  };

  const handleDecrease = () => {
    setAverageValue((prevValue) => String(Number(prevValue) - 1));
  };

  const handleShowAverage = () => {
    if (!averageValue || isNaN(parseFloat(averageValue))) {
      alert('Please enter a valid numeric average value.');
      return;
    }
    const windowSize = 1000; // You can adjust the window size based on your preference
    const averageYValues = chartData[0]?.data.map((dataPoint, index, array) => {
      const startIndex = Math.max(0, index - windowSize + 1);
      const windowData = array.slice(startIndex, index + 1);
      const sum = windowData.reduce((acc, point) => acc + point[1], 0);
      const avg = sum / Math.min(windowSize, index + 1 - startIndex);
      return [dataPoint[0], avg];
    });
    
    const averageSeriesData = [{
      name: `Rolling Average ${averageValue}`,
      data: averageYValues,
    }];
    
    setChartData(averageSeriesData);
  };    
  const chartOptions = {
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: (val) => {
          if (!isNaN(val) && isFinite(val)) {
            const date = new Date(val);
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const seconds = date.getUTCSeconds();
            const milliseconds = date.getUTCMilliseconds();
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
          }
          return '';
        },
      },
      title: {
        text: 'Time',
      },
      tickAmount: numXTicks,
    },
    yaxis: {
      type: 'numeric',
      title: {
        text: selectedYAxis,
      },
      stroke: {
        width: 0.5,
      },
      tickAmount: numYTicks,
      labels: {
        formatter: (val) => {
          if (!isNaN(val) && isFinite(val)) {
            return val.toFixed(2); // Display two decimal points
          }
          return '';
        },
      },
    },
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96 h-72" style={{ width: '1000px', height: '1000px' }}>
        <p className="mb-4">Selected Records for Comparison:</p>
        {selectedRecords && selectedRecords.length > 0 ? (
          <ul>
            {selectedRecords.map((record) => (
              <li key={record.fileName}>{record.fileName}</li>
            ))}
          </ul>
        ) : (
          <p>No records selected for comparison.</p>
        )}

        <p className="mt-4 mb-2">Select Y-Axis Variable:</p>
        <div className="flex items-center mb-4">
          {['Tension', 'Torsion', 'Bending Moment Y', 'Temperature'].map((option) => (
            <label key={option} className="mr-4">
              <input
                type="radio"
                value={option}
                checked={selectedYAxis === option}
                onChange={() => setSelectedYAxis(option)}
              />
              {option}
            </label>
          ))}
        </div>

        <div className="mb-4" style={{ position: 'absolute', width: '100px', left: '55%', top: '40px' }}>
      <label className="block mb-2">points for Average:</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <button
          className="text-gray-500 px-2 py-2"
          onClick={handleDecrease}
          style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)' }}
        >
          &#9660; {/* Unicode character for down arrow */}
        </button>
        <input
          type="text"
          value={averageValue}
          onChange={handleAverageChange}
          className="border p-2 w-full text-center"
        />
        <button
          className="text-gray-500 px-2 py-2"
          onClick={handleIncrease}
          style={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)' }}
        >
          &#9650; {/* Unicode character for up arrow */}
        </button>
      </div>
      <button
        className="bg-gray-500 text-white px-4 py-2 mt-2"
        onClick={handleShowAverage}
        style={{ position: 'absolute', width: '180px' }}
      >
        Show Average
      </button>
        </div>

        <ReactApexChart
          options={chartOptions}
          series={chartData}
          type="line"
          height="500"
          width="85%"
        />

        <button className="bg-gray-300 px-4 py-2 mt-4" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CompareValuesPopup;


