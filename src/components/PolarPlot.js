import React, { useEffect, useRef, useState } from 'react';
import Dygraph from 'dygraphs';
import html2canvas from 'html2canvas';

const PolarPlot = ({ isVisible, onClose, fileData }) => {
  const [graph, setGraph] = useState(null);
  const graphContainerRef = useRef(null);
  const [numPoints, setNumPoints] = useState('');
  const [dataPoints, setDataPoints] = useState([]);
  const [displayData, setDisplayData] = useState([]); 

  const [sliderValue, setSliderValue] = useState(0); // State to track slider position
  const [initialDateWindow, setInitialDateWindow] = useState([0, 0]); // State to store the initial date window
  const [sliderTime, setSliderTime] = useState(''); // State to store the time value

  const drawSpecialPoints = (dygraph) => {
    const ctx = dygraph.canvas_ctx_;
  
    if (dataPoints.length > 0) {
      const firstPoint = dygraph.toDomCoords(dataPoints[0][0], dataPoints[0][1]);
      const lastPoint = dygraph.toDomCoords(dataPoints[dataPoints.length - 1][0], dataPoints[dataPoints.length - 1][1]);
  
      ctx.save();
      ctx.beginPath();
      ctx.arc(firstPoint[0], firstPoint[1], 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.closePath();
  
      ctx.beginPath();
      ctx.arc(lastPoint[0], lastPoint[1], 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    } else {
      console.error("No data points available for drawing special points.");
    }
  };
  

useEffect(() => {
  if (isVisible && fileData && typeof fileData === 'string') {
    const rows = fileData.split('\n');
    let data = [];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < rows.length; i++) {
      const line = rows[i].trim();
      if (line.startsWith('Tension;Torsion;Bending moment X;Bending moment Y;Time;Temperature')) {
        for (let j = i + 1; j < rows.length; j++) {
          const rowData = rows[j].split(';').map(item => parseFloat(item.replace(',', '.')));

          if (rowData.length === 6) {
            const xValue = rowData[2]; // Bending moment X
            const yValue = rowData[3]; // Bending moment Y

            if (!isNaN(xValue) && !isNaN(yValue)) {
              data.push([xValue, yValue]);

              // Update min and max values for X and Y axes
              minX = Math.min(minX, xValue);
              maxX = Math.max(maxX, xValue);
              minY = Math.min(minY, yValue);
              maxY = Math.max(maxY, yValue);
            }
          }
        }
        break;
      }
    }

      setDataPoints(data);

      if (data.length > 0) {

        // Calculate the maximum absolute values for x and y axes
        const maxXAbs = Math.max(Math.abs(minX), Math.abs(maxX));
        const maxYAbs = Math.max(Math.abs(minY), Math.abs(maxY));

        // Calculate the overall maximum range considering positive and negative values separately for x and y axes
        const maxRangeX = Math.max(maxXAbs, -minX);
        const maxRangeY = Math.max(maxYAbs, -minY);

        const maxRange = Math.max(maxRangeX, maxRangeY);

        const polarPlot = new Dygraph(graphContainerRef.current, data, {
          labels: ['Bending moment X', 'Bending moment Y'],
          title: 'Polar Plot - Scatter',
          showLabelsOnHighlight: false,
          showRoller: false,
          xlabel: 'Bending moment X',
          ylabel: 'Bending moment Y',
          ylabelWidth: 100,
          drawPoints: true,
          strokeWidth: 0.0,
          pointSize: 1.5,
          highlightCircleSize: 7,
          // drawPointCallback: function (g, seriesName, canvasContext, cx, cy, color, pointSize) {
          //   canvasContext.fillStyle = color; // Set color
          //   canvasContext.fillRect(cx - pointSize, cy - pointSize, pointSize * 2, pointSize * 2); // Draw a square
          // },
    

          colors: ['#4285F4'],
          width:600,
          height:500,
          gridLineColor: 'transparent',
          dateWindow: [-maxRange, maxRange],
          axes: {
            x: {
              axisLabelFormatter: (d) => d.toFixed(3),
              valueFormatter: (x) => x.toFixed(3),
              drawGrid: false,
              valueRange: [-maxRange, maxRange], // Maintain the same range for x-axis
              pixelsPerLabel: 30, // Adjust the number of pixels per label/tick for x-axis
              axisLabelWidth: 50, // Adjust the axis label width for x-axis as needed
            },
            y: {
              axisLabelFormatter: (d) => d.toFixed(3),
              valueFormatter: (y) => y.toFixed(3),
              drawGrid: false,
              valueRange: [-maxRange, maxRange],// Maintain the same range for y-axis
              pixelsPerLabel: 30, // Adjust the number of pixels per label/tick for y-axis
              axisLabelWidth: 50, // Adjust the axis label width for y-axis as needed
            },
            x2: {
              valueRange: [-maxRange, maxRange], // Maintain the same range for -x axis
            },
            y2: {
              valueRange: [-maxRange, maxRange], // Maintain the same range for -y axis
            },
          },
          underlayCallback: (canvas, area, g) => {
            const zeroX = g.toDomXCoord(0); // Get canvas coordinate for x = 0
            const zeroY = g.toDomYCoord(0); // Get canvas coordinate for y = 0
        
            canvas.beginPath();
            canvas.setLineDash([5, 5]); // Set the line dash pattern [dash length, gap length]
            canvas.strokeStyle = '#000'; // Color for the dashed lines
        
            // Draw dashed line along x-axis passing through (0,0)
            canvas.moveTo(area.x, zeroY);
            canvas.lineTo(area.x + area.w, zeroY);
            canvas.stroke();
        
            // Draw dashed line along y-axis passing through (0,0)
            canvas.moveTo(zeroX, area.y);
            canvas.lineTo(zeroX, area.y + area.h);
            canvas.stroke();
          },
          
          
          drawCallback: (dygraph, is_initial) => {
            if (is_initial) {
              drawSpecialPoints(dygraph);
            }
          },
    });

        // Set the ylabel rotation and other styles after the Dygraph initializes
        polarPlot.ready(() => {
          const yLabelElem = graphContainerRef.current.querySelector('.dygraph-ylabel');
        
          if (yLabelElem) {
            yLabelElem.style.transform = 'rotate(-90deg)';
            yLabelElem.style.width = '150px'; // Adjust the width as needed
            yLabelElem.style.overflow = 'hidden';
            yLabelElem.style.textOverflow = 'ellipsis';
            yLabelElem.style.fontWeight = 'bold';
            yLabelElem.style.fontSize = '16px'; // Adjust the font size as needed
            yLabelElem.style.marginLeft = '150px'; // Adjust the margin as needed
          }
        });


        const xAxisLabel = graphContainerRef.current.querySelector('.dygraph-xlabel');
        if (xAxisLabel) {
          xAxisLabel.style.fontSize = '16px'; // Adjust the font size as needed
          xAxisLabel.style.textAlign = 'center'; // Center align the x-axis label
          xAxisLabel.style.fontWeight = 'bold'; // Set font weight if needed
          xAxisLabel.style.marginTop = '10px'; // Adjust top margin as needed
        }
      

        setGraph(polarPlot);
      }
    }

    return () => {
      if (graph) {
        graph.destroy();
      }
    };
  }, [isVisible, fileData]);

  const handlePointsChange = (e) => {
    setNumPoints(e.target.value);
  };

  const updateGraph = () => {
    const displayPoints = numPoints ? parseInt(numPoints) : dataPoints.length;
    const displayData = dataPoints.slice(0, displayPoints);
  
    graph.updateOptions({
      file: displayData,
    });

    drawSpecialPoints(graph);
     // Update displayData state with newDisplayData
     setDisplayData(displayData);

     // Find the time corresponding to the first and last data points
     if (displayData.length > 0) {
      let firstPointTime = 'Not Found';
      let lastPointTime = 'Not Found';
  
      // Find matching coordinates for the first and last points in dataPoints
      for (let i = 0; i < dataPoints.length; i++) {
        const [x, y] = dataPoints[i];
        if (x === displayData[0][0] && y === displayData[0][1]) {
          const rawTime = fileData.split('\n')[8 + i].split(';')[4];
          firstPointTime = formatTime(rawTime);
        }
        if (
          x === displayData[displayData.length - 1][0] &&
          y === displayData[displayData.length - 1][1]
        ) {
          const rawTime = fileData.split('\n')[8 + i].split(';')[4];
          lastPointTime = formatTime(rawTime);
        }
      }
  
      // Display the times below the graph
      const redPointTime = document.getElementById('redPointTime');
      const blackPointTime = document.getElementById('blackPointTime');
      
      if (redPointTime && blackPointTime) {
        redPointTime.innerText = firstPointTime;
        blackPointTime.innerText = lastPointTime;
      }
    }
  };
  
  // Function to format time in hh:mm:ss
  const formatTime = (rawTime) => {
    const timeInSeconds = parseFloat(rawTime);
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds - Math.floor(timeInSeconds)) * 100);
  
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };


  const zoomIn = () => {
    if (graph) {
      const newWindow = graph.xAxisRange(); // Get the current visible x-axis range
      const windowWidth = newWindow[1] - newWindow[0];

      // Zoom in by 20% of the current window width
      const newWidth = windowWidth * 0.8;
      const midpoint = (newWindow[0] + newWindow[1]) / 2;

      graph.updateOptions({
        dateWindow: [midpoint - newWidth / 2, midpoint + newWidth / 2],
      });
      updateSliderValue();
    }
  };

  const zoomOut = () => {
    if (graph) {
      const newWindow = graph.xAxisRange(); // Get the current visible x-axis range
      const windowWidth = newWindow[1] - newWindow[0];

      // Zoom out by 20% of the current window width
      const newWidth = windowWidth * 1.25;
      const midpoint = (newWindow[0] + newWindow[1]) / 2;

      graph.updateOptions({
        dateWindow: [midpoint - newWidth / 2, midpoint + newWidth / 2],
      });
      updateSliderValue();
    }
  };

  const copyImageToClipboard = () => {
    if (!graphContainerRef.current) return;

    html2canvas(graphContainerRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imgData;
      downloadLink.download = 'polar_plot.png';
      downloadLink.click();
    });
  };


  // Function to update the graph based on the slider value
  const updateGraphWithSlider = (value) => {
    if (graph) {
      const numPoints = dataPoints.length;
      const index = Math.floor((value / 100) * (numPoints - 1)); // Calculate the index based on the slider value

      graph.updateOptions({
        dateWindow: initialDateWindow, // Keep the initial date window unchanged
      });

      const rawTime = fileData.split('\n')[8 + index].split(';')[4];
      const pointTime = formatTime(rawTime);
      setSliderValue(value); // Update the slider position
      setSliderTime(pointTime); // Update the time value
    }
  };

  useEffect(() => {
    if (graph) {
      setInitialDateWindow(graph.xAxisRange()); // Store the initial date window on graph initialization
    }
  }, [graph]);


  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    updateGraphWithSlider(value);
  };


  const updateSliderValue = () => {
    if (graph) {
      const currentWindow = graph.xAxisRange();
      const initialWidth = initialDateWindow[1] - initialDateWindow[0];
      const currentWidth = currentWindow[1] - currentWindow[0];
      const zoomLevel = ((initialWidth - currentWidth) / initialWidth) * 100;
  
      setSliderValue(zoomLevel);
    }
  };
  

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isVisible ? '' : 'hidden'}`}>
      <div className="bg-white p-4 rounded-md" onClick={stopPropagation}>
        <div className="w-full" ref={graphContainerRef}></div>
        <div className="flex flex-col">
        <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full p-2 border border-gray-400 rounded-md mr-2"
            />
        </div>
        <div className="flex justify-between">
          <div className="border p-2 text-gray-600 font-bold">
            <div className="border-b mb-1">Red Point Time:</div>
            <div id="redPointTime"></div>
          </div>
          <div className="border p-2  text-gray-600 font-bold ml-2">
            <div className="border-b mb-1">Black Point Time:</div>
            <div id="blackPointTime"></div>
          </div>
          <div className="border p-2 text-gray-600 font-bold ml-2">
              <div className="border-b mb-1">Slider Time:</div>
              <div id="sliderTimeBetweenPoints">{sliderTime}</div>
          </div>
        </div>
        
          <div className="pl-4 mb-1 self-start">nr.points</div> 
          <div className="relative flex items-center"> 
            <input
              type="number"
              placeholder={`Enter number of points (max: ${dataPoints.length})`}
              value={numPoints}
              onChange={handlePointsChange}
              className="p-2 pl-4 border border-gray-400 rounded-md mr-2" 
            />
            <button onClick={updateGraph} className="p-2 text-white bg-blue-500 rounded-md">
              Update Graph 
            </button>
            <button onClick={zoomIn} className="bg-green-500 rounded-md h-10 px-2 py-2 mt-2 mb-2 ml-2 text-white font-poppins flex flex-wrap">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEDklEQVR4nO2Ua0xbZRjHz3QXZzbDnJkfNlgiqKUNrNCtdFh6oLTQsoaWy6GV0gK9SWEiY1naaOBoLHHuogFnAGPELWFkU8dG1EE2HZu7RBaTeYlZsmWCxs1kfvD2SRN/ptmawKIxaWHxg7/kTd7n+T9vfjnnvDmC8D//QEaYVevDZK97irWCzGJhIVG2siIzzHOZLXyd1cJ0VpjzWS18lRXmh6wwI5lt5M+7VBWkUBliWhnkVVWIzOwAKmUIizKEPreFNcoQ9cogl7OD7BUk7p0XqaYZvdrHTH4AXZ4Pj9rHVbWfi2o/I3k+PlD7uZHn582NTaSr/RxS+zmQsnRDI2kFzcxsbGKTtpm+gmbObG5EMXvG8jTLCpqJapu4UhgiU9vEiYJGgimJi7zEijzsLGrAX+ThlFJiaSK7tWdRotY34NJ7+UxsIKvIy4xOYnmSWhaVuvmmzEm6yc10aT2PzE5L3Uya61HP7pnqGTW5qSt1c7i0HntSWptEhtXFl5Y6dFYXH9+ZVziZrLhDbH0Sh9XJQauLYIWTPUmJK2socNQyXlWLyyExEO/Z7aRVSRy9vX6skjgV31dLeOK5w0m2o5YLVRIWh8RIUmJJIqeumjOuKirram7dVEliqbOG4tvrUl0tgfi+vvrWZ3DVsLGumpOuKmqd1byRlNht4QGvneseGxleB9dkmXtm5147k432ua/aY2e7x8FOrwPZ4yAqJIvfxkc+G6UBG+8HtuCdnQVsdAYsrEvUvkpW+m1ca7Sh8Nv4orkSZdLirVasbVbOtVl5rNXKTNiC+HdzrSIr2qwcb7PyfKsFd2sFHwqpsq2MQx3l7OkoJ7+jjKsdZQx0WtC3G3n4mXIe7ywj3FHOlY4yXmy3kLutnJl2E4+mLJZt3B8xczJi5sCzW1gbNbE1YmIiauJyxMxUxMxrERM5UTNS1MxPETMNKUsTyCKLu43IXUa+6zbyulxCtSyi6zJi7jayvbuEqS4jp7uNRLpK+HxHISvj56J6VoU0LBFSRRZ5KCYS6DEwFDNwPGZgtEckFhPRJWbidY+Boz0iwR6R6zEDl2SRtJTl/4Ysct+uJ/h2l54LuzezfreBT3cbONtrYZmwUAxqWNKn41yfjsG9Otb2ljC1K8QvL4e52StyRBbm/gvmjX0iKwa0fN+vxTtYzM3BF/h98AgMVPJrv47pfi175892B0Maioc28cfoSzC2jz/fLuLn/ZvxHdax/C0N54c0tC+YfFiH+1Ahvx3UcmM4H02iv38Tq4fVzBzIZc2Cyd/NpfOdHM7Gn3ROP4dP3lOxQVhIjql45ZiK0cNKliKwaEzFjjElFxfskiWIC8YV9E4omJ5QcGU8m7ETClYLd4txJQ+eziT9rgmF/zp/AaT0NAjiSSNHAAAAAElFTkSuQmCC">
            </img>
              {/* Zoom In */}
            </button>
            <button onClick={zoomOut} className="bg-red-500 rounded-md h-10 px-2 py-2 mt-2 mb-2 ml-2 text-white font-poppins flex flex-wrap">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD3ElEQVR4nO2WXUybVRyH3+nGnGEGMjNNxnA4bCmTNoF2K1DaQgu0o6EFfKG0tFBaygpzSBe0xMhrMmAmsA9Ak0E0bpiMQdxwCRMd6OI+I8bETKMmIxto3Ex2Y6ZXmvgYshA/sslS1sULn+TcnPP7nycn55+TIwj/cxeSQyQ+2YIiqZUNgsRKIZakNxGfEuLllCa+TgkxlxLi4qYQX20K8WNKiJHkZjLvu1TeQI48yJy8kQOpQTYrAmyRBbHIguiUO1gvD+JKa+QbeSP7BJGH74tUubC5n3llkG3KejwqP7PKAJ+p/IwoA5xSBbih8vOmOsRGVYBjqgDDy5aqaknQ1DGnrkOj9tGv9nE2q5a0v2ZSn2e1xkdEU8eVnCCbNT5Oa2ppWJY410unzsve3Br8Og9n0kXi7pbV1eDM9fK5oYZUnZd5rciaKLWsMLm5VlTFRpObOZOLp5eqMLkYN7upLHAxanJhj0prE0m2VvOlxY3W6uTje6mxVuOwVnPU6qRhezW9UYlLnWxziHxQVonTIXJoYc5uJ8Eu8t4dhmdh3VGFwi5yqUzEYhcZiUosimRUlnPWWUZpZcXtThVF4qoqMP5zuMpvX4OzAnVlOdPOMp6rKmcoKrHbwmNeO9c9NpK9Dq5KEg8tVeOxs9vj4DWvA8njICJEi9/GR/U2TAEbE4ESvP+WrS9lrd/G1VobaX4bl32lpEct3mnF2mzlQrMVWZOV+ZAFw51yTQbim61MNlt5tcmCu2k77wvLJVzEaLiY3heKyWwtYjZcxKGwBd2uAp5oKUYeLiIULuZKuIg9uywow8XMt5l5ZtliycajERPT7SaGO0vYEDGzs93EhxEz37abmWk3MfCSmYxIIWK7mZ/aC6lZtnQRycDKDiNSRz7fd+TzhpRPuWRA+0oBhR1GdktGZjqMfCIZeVHK53JbDmsX6iI6EoNZrBKWS6+Bx/fmEejW83ZXHpPdesa78ujsNKBdzHTr2dOVx8kuAw3deq536flCMpAgxBrJwCP7cvmuV8elnmye6tHzaY+e830WVsdMOpjFqgEtF/q1DPZtJWnAyMzBBm4d3MHNPj3jkrD0WxAVrxuIH9Tww9BWvEN53ByW+PXoKLxVws9DWq4Nadgf3c73wBE1hiNqfpvshNP9/P5OLreGs/GNaVlzOIuLhzNpiZl8TIPr3Wx+GVNz41jGn3+xExrWjaiYH1ayPmby4xm0nsjg/MJJ/zb/LOeOb0ElxJJTCvZPpDM+lk4cAismFLRNKJiJWZMtsiCYltE3JWNuSs7slIyTU2msEx4U55JJPJNK0gMTCv91/gBoPyAF18Gm1QAAAABJRU5ErkJggg=="></img>
              {/* Zoom Out */}
            </button>
            <button onClick={copyImageToClipboard} className="p-2 text-white bg-gray-800 rounded-md ml-2">
            Image to Clipboard
          </button>
            <div className="flex-grow" /> 
            <div className="flex"> 
              <button onClick={onClose} className="p-2 text-white bg-gray-800 rounded-md font-poppins">
                Close 
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolarPlot;