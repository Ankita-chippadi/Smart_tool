import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist';
import 'tailwindcss/tailwind.css';

const LineGraph = ({ data, isOtherWindowOpen, importedFileName, selectedFiles: propSelectedFiles }) => {
  const chartRef = useRef(null);
  const [cursorValues, setCursorValues] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState({
    tension: true,
    torsion: true,
    bendingMomentY: true,
    temperature: true,
  });
  
  const [chartData, setChartData] = useState([]);
  const [windowSize, setWindowSize] = useState(10);
  const [viewBounds, setViewBounds] = useState(false);
  const [showVerticalLines, setShowVerticalLines] = useState(false);

  const initialTimePoints = [38, 40, 42, 44, 46, 48, 50, 52, 54, 56];
  const yConstantValue = 10;
  const formattedTimePoints = initialTimePoints.map(time => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.000`;
  });
  const [statistics, setStatistics] = useState({
    Tension: { mean: " ", minValue: " ", maxValue: " ", slope: " " },
    Torsion: { mean: " ", minValue:  " ", maxValue: " ", slope:  " "},
    BendingMomentY: { mean:  " ", minValue:  " ", maxValue:  " ", slope:  " " },
    Temperature: { mean:  " ", minValue:  " ", maxValue: " ", slope:  " " },
  });
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const updateGraph = () => {
      const traceTension = {
        type: 'scatter',
        mode: 'lines',
        name: 'Tension',
        x: formattedTimePoints,
        y: Array(formattedTimePoints.length).fill(yConstantValue),
        line: { color: '#000080' },
        yaxis: 'y',
        stroke: {
          width: 1,
        },
      };

      const traceTorsion = {
        type: 'scatter',
        mode: 'lines',
        name: 'Torsion',
        x: formattedTimePoints,
        y: Array(formattedTimePoints.length).fill(yConstantValue),
        line: { color: '#800080' },
        yaxis: 'y2',
        stroke: {
          width: 0.5,
        },
      };

      const traceBendingMomentY = {
        type: 'scatter',
        mode: 'lines',
        name: 'Bending Moment Y',
        x: formattedTimePoints,
        y: Array(formattedTimePoints.length).fill(yConstantValue),
        yaxis: 'y3',
        line: { color: '#ADD8E6' },
        stroke: {
          width: 0.5,
        },
      };

      const traceTemperature = {
        type: 'scatter',
        mode: 'lines',
        name: 'Temperature',
        x: formattedTimePoints,
        y: Array(formattedTimePoints.length).fill(yConstantValue),
        line: { color: '#ff0000' },
        yaxis: 'y4',
        stroke: {
          width: 0.5,
        },
      };

      let shapes = [];
      if (showVerticalLines) {
        shapes = [
          {
            type: 'line',
            xref: 'x',
            yref: 'paper',
            x0: 0.5,
            y0: 0,
            x1: 0.5,
            y1: 1,
            line: {
              color: 'rgb(55, 128, 191)',
              width: 3,
            },
          },
          {
            type: 'line',
            xref: 'x',
            yref: 'paper',
            x0: 0.7,
            y0: 0,
            x1: 0.7,
            y1: 1,
            line: {
              color: 'rgb(55, 128, 191)',
              width: 3,
            },
          },
        ];
      }

      const layout = {
        height: 550,
        width: 1500,
        position: 'relative',
        left: '100px',
        xaxis: {
          type: 'linear',
          tickformat: '%H:%M:%S.%L',
          tickmode: 'array',
          tickvals: formattedTimePoints,
          ticktext: formattedTimePoints,
        },
        yaxis: {
          title: 'Tension',
          titlefont: { color: '#1f77b4' },
          tickfont: { color: '#1f77b4' },
          side: 'left',
          range: [-187, 1050],
          tickAmount: 22,
          showgrid: false,
        },
        yaxis2: {
          title: 'Torsion',
          titlefont: { color: '#800080' },
          tickfont: { color: '#800080' },
          overlaying: 'y',
          side: 'left',
          position: 0.05,
          range: [0, 9],
          tickAmount: 18,
          showgrid: false,
        },
        yaxis3: {
          title: 'Bending Moment Y',
          titlefont: { color: '#006400' },
          tickfont: { color: '#006400' },
          overlaying: 'y',
          side: 'left',
          position: 0.1,
          range: [0, 12.5],
          tickAmount: 25,
          showgrid: false,
        },
        yaxis4: {
          title: 'Temperature',
          titlefont: { color: '#ff0000' },
          tickfont: { color: '#ff0000' },
          overlaying: 'y',
          side: 'right',
          range: [26.6, 31.4],
          tickAmount: 15,
          showgrid: false,
        },
        margin: { t: 10 },
        shapes: shapes,
      };

      const options = {
        scrollZoom: true,
      };

      Plotly.newPlot(chartRef.current, [traceTension, traceTorsion, traceBendingMomentY, traceTemperature], layout, options);

      const lines = document.querySelectorAll('.shapelayer path');
      lines.forEach((line, index) => {
        line.addEventListener('mousedown', (event) => {
          event.stopPropagation(); // Prevent event propagation to the graph
    
          let isDragging = true;
          const rect = chartRef.current.getBoundingClientRect();
          const offsetX = event.clientX - rect.left;
          const offsetY = event.clientY - rect.top;
    
          const mouseMoveHandler = (e) => {
            if (isDragging) {
              const newX = (e.clientX - rect.left) / rect.width;
              Plotly.relayout(chartRef.current, `shapes[${index}].x0`, newX);
              Plotly.relayout(chartRef.current, `shapes[${index}].x1`, newX);
            }
          };
    
          const mouseUpHandler = () => {
            isDragging = false;
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
          };
    
          document.addEventListener('mousemove', mouseMoveHandler);
          document.addEventListener('mouseup', mouseUpHandler);
        });
      });
    };

    updateGraph();

    const base = chartRef.current;
    base.on('plotly_hover', (eventData) => {
      if (eventData.points && eventData.points.length > 0) {
        const closestPoint = eventData.points[0];
        const cursorValue = {
          yAxis: closestPoint.y.toFixed(3),
          tension: closestPoint.data.tension[closestPoint.pointNumber].toFixed(3),
          torsion: closestPoint.data.torsion[closestPoint.pointNumber].toFixed(3),
          bendingMomentY: closestPoint.data.bendingMomentY[closestPoint.pointNumber].toFixed(3),
          temperature: closestPoint.data.temperature[closestPoint.pointNumber].toFixed(3),
          xAxis: closestPoint.x,
        };

        console.log('Cursor Value:', cursorValue);

        setCursorValues([cursorValue]);
      } else {
        setCursorValues([]);
      }
    });

    return () => {
      if (base) {
        base.removeAllListeners('plotly_hover');
      }
    };
  }, [formattedTimePoints, showVerticalLines]);

  useEffect(() => {
    if (!chartRef.current || !data || typeof data !== 'string') {
      return;
    }

    const lines = data.split('\n');
    const chunkSize = 2000;
    const chunks = [];
    for (let i = 0; i < lines.length; i += chunkSize) {
      chunks.push(lines.slice(i, i + chunkSize));
    }

    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        const newChartData = chunk
          .filter((line) => !line.startsWith('#') && line.trim() !== '' && !isNaN(line.trim().split(';')[0]))
          .map((line, index) => {
            const values = line.split(';').map((value) => parseFloat(value.replace(',', '.')));

            if (values.length < 6 || values.some(isNaN)) {
              console.error(`Error parsing values at line ${index + 1}: ${line}`);
              return null;
            }

            const timeIndex = 4;
            const time = values[timeIndex];

            if (isNaN(time)) {
              console.error(`Error parsing time at line ${index + 1}: ${line}`);
              return null;
            }

            return {
              x: time,
              tension: values[0],
              torsion: values[1],
              bendingMomentY: values[3],
              temperature: values[5],
            };
          })
          .filter((row) => row !== null);

        console.log('ChartData:', newChartData);
        setChartData((prevChartData) => [...prevChartData, ...newChartData]);
      }, index * 100);
    });
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !chartData || chartData.length === 0) {
      return;
    }

    const filteredChartData = chartData.map((item) => ({
      x: item.x,
      tension: filteredSeries.tension ? item.tension : null,
      torsion: filteredSeries.torsion ? item.torsion : null,
      bendingMomentY: filteredSeries.bendingMomentY ? item.bendingMomentY : null,
      temperature: filteredSeries.temperature ? item.temperature : null,
    }));

    const cleanedChartData = filteredChartData.map((item) => ({
      x: item.x,
      tension: isNaN(item.tension) ? 0 : item.tension,
      torsion: isNaN(item.torsion) ? 0 : item.torsion,
      bendingMomentY: isNaN(item.bendingMomentY) ? 0 : item.bendingMomentY,
      temperature: isNaN(item.temperature) ? 0 : item.temperature,
    }));

    const traceTension = {
      type: 'scatter',
      mode: 'lines',
      name: 'Tension',
      x: cleanedChartData.map((item) => item.x),
      y: cleanedChartData.map((item) => item.tension),
      line: { color: '#000080' },
      yaxis: 'y',
      stroke: {
        width: 1,
      },
    };

    const traceTorsion = {
      type: 'scatter',
      mode: 'lines',
      name: 'Torsion',
      x: cleanedChartData.map((item) => item.x),
      y: cleanedChartData.map((item) => item.torsion),
      line: { color: '#800080' },
      yaxis: 'y2',
      stroke: {
        width: 0.5,
      },
    };

    const traceBendingMomentY = {
      type: 'scatter',
      mode: 'lines',
      name: 'Bending Moment Y',
      x: cleanedChartData.map((item) => item.x),
      y: cleanedChartData.map((item) => item.bendingMomentY),
      yaxis: 'y3',
      line: { color: '#006400' },
      stroke: {
        width: 0.5,
      },
    };

    const traceTemperature = {
      type: 'scatter',
      mode: 'lines',
      name: 'Temperature',
      x: cleanedChartData.map((item) => item.x),
      y: cleanedChartData.map((item) => item.temperature),
      line: { color: '#ff0000' },
      yaxis: 'y4',
      stroke: {
        width: 0.5,
      },
    };

    const layout = {
      height: 650,
      width: 1800,
      position: 'relative',
      top: '200px',

      xaxis: {
        type: 'numeric',
        tickformat: '%H:%M:%S,%L',
        tickmode: 'array',
        nticks: 15,
        tickvals: cleanedChartData
          .filter((item, index) => index % Math.ceil(cleanedChartData.length / 15) === 0)
          .map(item => item.x),
        ticktext: cleanedChartData
          .filter((item, index) => index % Math.ceil(cleanedChartData.length / 15) === 0)
          .map(item => {
            const date = new Date(item.x * 1000);
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const seconds = date.getUTCSeconds();
            const milliseconds = date.getUTCMilliseconds();
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${milliseconds}`;
          }),
      },
      yaxis: {
        title: 'Tension',
        titlefont: { color: '#1f77b4' },
        tickfont: { color: '#1f77b4' },
        side: 'left',
        showgrid: false,
      },
      yaxis2: {
        title: 'Torsion',
        titlefont: { color: '#800080' },
        tickfont: { color: '#800080' },
        overlaying: 'y',
        side: 'left',
        position: 0.05,
        showgrid: false,
      },
      yaxis3: {
        title: 'Bending Moment Y',
        titlefont: { color: '#006400' },
        tickfont: { color: '#006400' },
        overlaying: 'y',
        side: 'left',
        position: 0.1,
        showgrid: false,
      },
      yaxis4: {
        title: 'Temperature',
        titlefont: { color: '#ff0000' },
        tickfont: { color: '#ff0000' },
        overlaying: 'y',
        side: 'right',
        showgrid: false,
      },
      margin: { t: 10 },
      shapes: [
        {
          type: 'line',
          xref: 'x',
          yref: 'paper',
          x0: 0.5,
          y0: 0,
          x1: 0.5,
          y1: 1,
          line: {
            color: 'rgb(0, 0,0)',
            width: 3,
          },
          visible: showVerticalLines, 
        },
        {
          type: 'line',
          xref: 'x',
          yref: 'paper',
          x0: 0.7,
          y0: 0,
          x1: 0.7,
          y1: 1,
          line: {
            color: 'rgb(0, 0,0)',
            width: 3,
          },
          visible: showVerticalLines,
        },
      ],
    };
  
    const options = {
      scrollZoom: true,
    };

    Plotly.newPlot(chartRef.current, [traceTension, traceTorsion, traceBendingMomentY, traceTemperature], layout, options);
  }, [chartData, filteredSeries, showVerticalLines]); // Add chartData as a dependency
   

  const toggleViewBounds = () => {
    setViewBounds(!viewBounds);
    setShowVerticalLines(!showVerticalLines);
  };
  
  const calculateValues = () => {
    if (showVerticalLines) {
      const xCoordinate1 = 0.5;
      const xCoordinate2 = 0.7;
      const filteredData = chartData.filter(item => item.x >= xCoordinate1 && item.x <= xCoordinate2);
         
      const calculatedStatistics = {
        Tension: {
          mean: calculateMean(filteredData.map(item => item.tension)).toFixed(3),
          minValue: Math.min(...filteredData.map(item => item.tension)).toFixed(3),
          maxValue: Math.max(...filteredData.map(item => item.tension)).toFixed(3),
          slope: calculateSlope(filteredData.map(item => item.tension)).toFixed(3)
        },
        Torsion: {
          mean: calculateMean(filteredData.map(item => item.torsion)).toFixed(3),
          minValue: Math.min(...filteredData.map(item => item.torsion)).toFixed(3),
          maxValue: Math.max(...filteredData.map(item => item.torsion)).toFixed(3),
          slope: calculateSlope(filteredData.map(item => item.torsion)).toFixed(3)
        },
        BendingMomentY: {
          mean: calculateMean(filteredData.map(item => item.bendingMomentY)).toFixed(3),
          minValue: Math.min(...filteredData.map(item => item.bendingMomentY)).toFixed(3),
          maxValue: Math.max(...filteredData.map(item => item.bendingMomentY)).toFixed(3),
          slope: calculateSlope(filteredData.map(item => item.bendingMomentY)).toFixed(3)
        },
        Temperature: {
          mean: calculateMean(filteredData.map(item => item.temperature)).toFixed(3),
          minValue: Math.min(...filteredData.map(item => item.temperature)).toFixed(3),
          maxValue: Math.max(...filteredData.map(item => item.temperature)).toFixed(3),
          slope: calculateSlope(filteredData.map(item => item.temperature)).toFixed(3)
        },
      };
  
      setStatistics(calculatedStatistics);
   
    } else {
      console.log("Please view the bounds to calculate values.");
    }
  };
  
  useEffect(() => {
    // Redraw the graph after calculating values
    if (showVerticalLines) {
      // updateGraph();
    }
  }, [showVerticalLines, chartData, filteredSeries]);
  

  // Helper function to calculate mean
  const calculateMean = (values) => {
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return sum / values.length;
  };
  
  // Helper function to calculate slope
  // Helper function to calculate slope using the biquadratic equation and least squares method
const calculateSlope = (values) => {
  const n = values.length;
  let sumX = 0;   
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  // Calculate the sums of X, Y, XY, and XX
  for (let i = 0; i < n; i++) {
    sumX += i; // Assuming x values are indexed
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  // Calculate the slope using least squares regression formula
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  return slope; 
};

  useEffect(() => {
    // Rest of the code remains the same
    // Implement your remaining logic here
    
  }, [formattedTimePoints, showVerticalLines, chartData, filteredSeries]);

  return (
  <div style={{ display: isOtherWindowOpen ? 'none' : 'block', position: 'relative', zIndex: 2, opacity: 1, top: '50px', left: '85px',width:"20000px" }} className={isOtherWindowOpen ? 'hidden' : 'block'}>
     
    <div ref={chartRef} />
      <div className="mx-left max-w-md border p-4 flex flex-col ">
        <div className="font-bold text-black pr-4 w-40">Statistics</div>
      
          <div className="border border-black mb-4 p-4">
            <div className="flex flex-row mb-2">
            
          </div>
        
        <table className="border-collapse w-full">
          <thead>
            <tr className="bg-gray-500">
              <th className="p-2 border-r"> </th>
              <th className="p-2 border-r">Mean</th>
              <th className="p-2 border-r">Min Value</th>
              <th className="p-2 border-r">Max Value</th>
              <th className="p-2">Slope</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-bold border-r text-black">Tension</td>
              <td className="p-2 border-r">{statistics.Tension.mean}</td>
              <td className="p-2 border-r">{statistics.Tension.minValue}</td>
              <td className="p-2 border-r">{statistics.Tension.maxValue}</td>
              <td className="p-2">{statistics.Tension.slope}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold border-r text-black">Torsion</td>
              <td className="p-2 border-r">{statistics.Torsion.mean}</td>
              <td className="p-2 border-r">{statistics.Torsion.minValue}</td>
              <td className="p-2 border-r">{statistics.Torsion.maxValue}</td>
              <td className="p-2">{statistics.Torsion.slope}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold border-r text-black">Bending Moment Y</td>
              <td className="p-2 border-r">{statistics.BendingMomentY.mean}</td>
              <td className="p-2 border-r">{statistics.BendingMomentY.minValue}</td>
              <td className="p-2 border-r">{statistics.BendingMomentY.maxValue}</td>
              <td className="p-2">{statistics.BendingMomentY.slope}</td>
            </tr>    
            <tr className="border-b">
              <td className="p-2 font-bold border-r text-black">Temperature</td>
              <td className="p-2 border-r">{statistics.Temperature.mean}</td>
              <td className="p-2 border-r">{statistics.Temperature.minValue}</td>
              <td className="p-2 border-r">{statistics.Temperature.maxValue}</td>
              <td className="p-2">{statistics.Temperature.slope}</td>
            </tr>
          </tbody>
        </table>
  
      </div>   
      
      <button onClick={toggleViewBounds} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-10 w-48 mb-4 ">
          {viewBounds ? 'Hide Bounds' : 'View Bounds'}
        </button>
        <button onClick={calculateValues} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded h-10 w-48 mb-4">
          Calculate Values
        </button>

      </div>
     
      <input type="number" value={windowSize} onChange={(e) => setWindowSize(parseInt(e.target.value))} />
    </div>
  );
};

export default LineGraph;


