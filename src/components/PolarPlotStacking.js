import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist';

const PolarPlotStacking = ({ isVisible, onClose }) => {
  const [selectedFolderFiles, setSelectedFolderFiles] = useState([]);
  const [selectedFolderCheckboxes, setSelectedFolderCheckboxes] = useState({});
  const plotColors = ['#FF5733', '#33FF57', '#334CFF', '#FF33EC', '#AACCFF', '#FFAABB', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
  const [graphData, setGraphData] = useState([]);
  const [showGraph, setShowGraph] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const graphContainerRef = useRef(null);
  const [graphLimits, setGraphLimits] = useState([-1, 1]);
  const [calculateValues, setCalculateValues] = useState(false);
  const [calculateAngles, setCalculateAngles] = useState(false);
  const [graphPointer, setGraphPointer] = useState(null);

  const handleToggleCalculateValues = () => {
    setCalculateValues(!calculateValues);
  };

  const handleToggleCalculateAngles = () => {
    setCalculateAngles(!calculateAngles);
  };

  const handleFolderSelect = async () => {
    try {
      const folderInput = document.createElement('input');
      folderInput.setAttribute('type', 'file');
      folderInput.setAttribute('webkitdirectory', true);

      folderInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          const fileList = Array.from(files);
          setSelectedFolderFiles(fileList);
        }
      });

      folderInput.click();
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleCheckboxChange = async (file) => {
    try {
      const updatedCheckboxes = { ...selectedFolderCheckboxes };
      updatedCheckboxes[file.name] = !updatedCheckboxes[file.name];

      const updatedSelectedFiles = Object.keys(updatedCheckboxes)
        .filter((fileName) => updatedCheckboxes[fileName])
        .map((fileName) => selectedFolderFiles.find((file) => file.name === fileName));

      setSelectedFolderCheckboxes(updatedCheckboxes);
      setSelectedFiles(updatedSelectedFiles);

      const processedData = await Promise.all(updatedSelectedFiles.map(async (file, index) => {
        const fileContent = await readFileContent(file);
        const processedContent = processFileContent(fileContent);
        return { file: file.name, data: processedContent, index };
      }));

      // Find maximum absolute value from all data
      let maxAbsoluteValue = 0;
      processedData.forEach(({ data }) => {
        data.forEach(({ bendingMomentX, bendingMomentY }) => {
          const absX = Math.abs(bendingMomentX);
          const absY = Math.abs(bendingMomentY);
          maxAbsoluteValue = Math.max(maxAbsoluteValue, absX, absY);
        });
      });

      // Set graph limits based on the maximum absolute value
      const graphLimits = [-maxAbsoluteValue, maxAbsoluteValue];

      setGraphData(processedData);
      setShowGraph(true);
      setGraphLimits(graphLimits); // Add this line to update graph limits
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };

  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        resolve(content);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const processFileContent = (fileContent) => {
    const lines = fileContent.split('\n');
    const dataStartIndex = lines.findIndex(line => line.startsWith('Tension;Torsion;Bending moment X;Bending moment Y;Time;Temperature'));

    if (dataStartIndex !== -1) {
      const data = lines.slice(dataStartIndex + 2).map(line => {
        const [Tension, _torsion_, bendingMomentX, bendingMomentY, _time__, _temperature__] = line.split(';');
        return { bendingMomentX: parseFloat(bendingMomentX), bendingMomentY: parseFloat(bendingMomentY) };
      });

      const maxLength = Math.max(data.length, data.filter(({ bendingMomentX }) => !isNaN(bendingMomentX)).length, data.filter(({ bendingMomentY }) => !isNaN(bendingMomentY)).length);
      const alignedData = data.map(({ bendingMomentX, bendingMomentY }) => ({
        bendingMomentX: isNaN(bendingMomentX) ? 0 : bendingMomentX,
        bendingMomentY: isNaN(bendingMomentY) ? 0 : bendingMomentY,
      }));

      while (alignedData.length < maxLength) {
        alignedData.push({ bendingMomentX: 0, bendingMomentY: 0 });
      }

      return alignedData;
    } else {
      return [];
    }
  };

  useEffect(() => {
    if (showGraph) {
      const graphContainer = graphContainerRef.current;

      const modifiedData = graphData.map((data, index) => {
        const newData = data.data.map((point, pointIndex, arr) => {
          if (pointIndex === arr.length - 1) {
            return {
              bendingMomentX: arr[0].bendingMomentX,
              bendingMomentY: arr[0].bendingMomentY,
            };
          }
          return point;
        });

        return {
          ...data,
          data: newData,
        };
      });

      const horizontalMidpointLine = {
        x: [graphLimits[0], graphLimits[1]],
        y: [0, 0],
        mode: 'lines',
        type: 'scatter',
        line: {
          color: 'black',
          width: 2,
          dash: 'dash',
        },
      };

      const verticalMidpointLine = {
        x: [0, 0],
        y: [-graphLimits[1], graphLimits[1]],
        mode: 'lines',
        type: 'scatter',
        line: {
          color: 'black',
          width: 2,
          dash: 'dash',
        },
      };

      const traces = modifiedData.map((data, index) => ({
        x: data.data.map(d => d.bendingMomentX),
        y: data.data.map(d => d.bendingMomentY),
        text: data.data.map(d => `(${d.bendingMomentX}, ${d.bendingMomentY})`),
        mode: 'markers',
        type: 'scatter',
        marker: {
          symbol: 'diamond',
          color: plotColors[index % plotColors.length],
        },
        hoverinfo:'none'
      }));
      traces.push(horizontalMidpointLine);
      traces.push(verticalMidpointLine);

      if (calculateValues) {
        const midpointX = 0.5 * (graphLimits[0] + graphLimits[1]);
        const midpointY = 0;

        const valuePointer = {
          x: [midpointX, midpointX],
          y: [graphLimits[0], graphLimits[1]],
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'red', // Change color as needed
            width: 2,
          },
        };

        traces.push(valuePointer);
        setGraphPointer({ type: 'value', x: midpointX, y: midpointY });
      } else {
        setGraphPointer(null);
      }

      if (calculateAngles) {
        // Add logic to calculate angle line and pointer
        const startPoint = { x: 0.2, y: 0.2 }; // Replace with your starting point
        const endPoint = { x: 0.8, y: 0.8 };   // Replace with your ending point
  
        const angleLine = {
          x: [startPoint.x, endPoint.x],
          y: [startPoint.y, endPoint.y],
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'blue', // Change color as needed
            width: 2,
          },
        };
  
        traces.push(angleLine);
        setGraphPointer({ type: 'angle', x: (startPoint.x + endPoint.x) / 2, y: (startPoint.y + endPoint.y) / 2 });
      } else {
        setGraphPointer(null);
      }

      const layout = {
        title: 'Bending Moments Scatter Plot',
        xaxis: {
          title: 'Bending Moment X',
          zeroline: true,
          zerolinecolor: 'black',
          showline: true,
          showticklabels: true,
          tickmode: 'linear',
          ticks: 'inside',
          range: graphLimits,
          fixedrange: true,
          layer: 'above traces',
        },
        yaxis: {
          title: 'Bending Moment Y',
          zeroline: true,
          zerolinecolor: 'black',
          showline: true,
          showticklabels: true,
          tickmode: 'linear',
          ticks: 'inside',
          range: graphLimits,
          fixedrange: true,
          layer: 'above traces',
        },
      };

      const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        scrollZoom: true,
      };

      if (graphContainer) {
        Plotly.newPlot(graphContainer, traces, layout, config);
      }
    }
  }, [showGraph, graphData, graphLimits, calculateValues, calculateAngles]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isVisible ? '' : 'hidden'}`}>
      <div className="bg-white p-4 rounded-md flex flex-col w-full max-w-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-full" ref={graphContainerRef}></div>

        <div className="flex justify-between items-center mt-4">
          <div>
            <h2 className="text-lg font-bold mb-2">Select Folder:</h2>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue mb-4"
              onClick={handleFolderSelect}
            >
              Select Folder
            </button>
            {selectedFolderFiles.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto">
                <h2 className="text-lg font-bold mb-2">Selected Files:</h2>
                <ul className="list-disc list-inside">
                  {selectedFolderFiles.map((file) => (
                    <li key={file.name} className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-500 h-5 w-5"
                        checked={selectedFolderCheckboxes[file.name] || false}
                        onChange={() => handleCheckboxChange(file)}
                      />
                      <span className="ml-2 text-gray-700">{file.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox text-blue-500 h-5 w-5"
                checked={calculateValues}
                onChange={handleToggleCalculateValues}
              />
              <span className="ml-2 text-gray-700">Calculate Values</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                className="form-checkbox text-blue-500 h-5 w-5"
                checked={calculateAngles}
                onChange={handleToggleCalculateAngles}
              />
              <span className="ml-2 text-gray-700">Calculate Angles</span>
            </label>
          </div>
        </div>

        {graphPointer && (
          <div
            className={`absolute w-4 h-4 rounded-full bg-red-500`}
            style={{
              left: `${graphPointer.x}%`,
              top: `${graphPointer.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          ></div>
        )}


        <div className="flex justify-end mt-4">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-red"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolarPlotStacking;