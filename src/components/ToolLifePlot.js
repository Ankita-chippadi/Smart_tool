import React, { useState,useRef } from 'react';
import ApexCharts from 'react-apexcharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ToolLifePlot = ({ onClose }) => {
  const [selectedFiles1, setSelectedFiles1] = useState([]);
  const [selectedFileIndex1, setSelectedFileIndex1] = useState(null); // Track selected file index for the first component
  const graphContainerRef = useRef(null);
  const [selectedFiles2, setSelectedFiles2] = useState([]);
  const [selectedFileIndex2, setSelectedFileIndex2] = useState(null); // Track selected file index for the second component
  const graphContainerRef1 = useRef(null);
  const graphContainerRef2 = useRef(null);
  const [selectedRadio, setSelectedRadio] = useState('BendingMomentX');

  const [chartOptions1, setChartOptions1] = useState({
    series: [],
    chart: {
      type: 'line',
      height: 350,
    },
    stroke: {
      width: 2, // Adjust the line width as needed
      colors: ['#28a745'], // Set the color to green
    },
    xaxis: {  
      title: {
        text: 'Time[hh:mm:ss]',
      },
      type: 'datetime',
      labels: {
        formatter: function (value) {
          const date = new Date(value);
          const hours = date.getUTCHours().toString().padStart(2, '0');
          const minutes = date.getUTCMinutes().toString().padStart(2, '0');
          const seconds = date.getUTCSeconds().toString().padStart(2, '0');
          return `${hours}:${minutes}:${seconds}`;
        },
      },
      tickAmount: 8,
      min: 0,
      max: 55,
    },
    yaxis: {
      title: {
        text: 'Bending Moment X',
      },   
      labels: {
        formatter: function (value) {
          return value.toFixed(1);
        },
      },
      tickAmount: 12,
      min: -8.8,
      max: 8.4,
    },
  });

  const [chartOptions2, setChartOptions2] = useState({
    series: [],
    chart: {
      type: 'line',
      height: 350,
    },
    stroke: {
      width: 2, // Adjust the line width as needed
  
    },
    xaxis: {
      title: {
        text: 'Number of Produced Unit',
      },
      labels: {
        formatter: function (value) {
          return Math.round(value); // Round the value to the nearest integer
        },
      },
      
      tickAmount: 10,
      min: 2,
      max: 15,
    },
    yaxis: {
      title: { 
        text: 'Bending Moment [Nm]',
      },
      labels: {
        formatter: function (value) {
          return value.toFixed(1);
        },
      },
      tickAmount: 10  ,
      min: -51.3545,
      max: 51.3545,
    },
  });
 

  const handleRadioChange = (event) => {
    setSelectedRadio(event.target.value);
    updateChartOptions(event.target.value);
  };

  const updateChartOptions = (selectedValue) => {
    let newYAxisLabel = '';
    let newYAxisMin = 0;
    let newYAxisMax = 0;
  
    switch (selectedValue) {
      case 'Tension': 
        newYAxisLabel = 'Tension';
        newYAxisMin = -187;
        newYAxisMax = 1050;
        break;
      case 'Torsion':
        newYAxisLabel = 'Torsion';
        newYAxisMin = 0;
        newYAxisMax = 9;
        break;
      case 'BendingMomentX':
      default:
        newYAxisLabel = 'Bending Moment X';
        newYAxisMin = -8.8;
        newYAxisMax = 8.4;
        break;
    }
  
    setChartOptions1({
      ...chartOptions1,
      yaxis: {  
        ...chartOptions1.yaxis,
        title: {
          text: newYAxisLabel,
        },
        min: newYAxisMin,
        max: newYAxisMax,
      },
    });
  
    // Call parseDataFile with the selected radio button value
    const parsedData = parseDataFile(selectedValue);
    // Use the parsedData as needed
  };
  
  const handleFileClick1 = (fileIndex) => {
    setSelectedFileIndex1(fileIndex); // Update selected file index for the first component
    const updatedFiles = selectedFiles1.map((file, index) =>
      index === fileIndex ? { ...file, selected: true } : { ...file, selected: false }
    );
    setSelectedFiles1(updatedFiles);
    handleRowClick(fileIndex, true);
  };

  const handleFileClick2 = (fileIndex) => {
    setSelectedFileIndex2(fileIndex); // Update selected file index for the second component
    const updatedFiles = selectedFiles2.map((file, index) =>
      index === fileIndex ? { ...file, selected: true } : { ...file, selected: false }
    );
    setSelectedFiles2(updatedFiles);
    handleRowClick(fileIndex, false);
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);

    const newFiles = files.map((file) => ({
      name: file.name,
      data: null,
      selected: false,
      file: file, // Store the file object itself
    }));

    // Determine which file browsing component was used and update state accordingly
    if (event.target.id === 'folderInput1') {
      setSelectedFiles1(newFiles);
    } else if (event.target.id === 'folderInput2') {
      setSelectedFiles2(newFiles);
    }

    event.target.value = '';
  };

  const handleRowClick = async (index, isFirstComponent) => {
    const selectedFiles = isFirstComponent ? selectedFiles1 : selectedFiles2;
    const setSelectedFiles = isFirstComponent ? setSelectedFiles1 : setSelectedFiles2;
    const setSelectedFileIndex = isFirstComponent ? setSelectedFileIndex1 : setSelectedFileIndex2;
    const setChartOptions = isFirstComponent ? setChartOptions1 : setChartOptions2;
  
    const selectedFile = selectedFiles[index];
  
    if (!selectedFile.data) {
      const file = selectedFile.file; // Retrieve the file object from the selected file
  
      const data = await readFile(file);
      const parsedData = parseDataFile(data);  
  
      if (parsedData.length > 0) {
        const updatedFiles = selectedFiles.map((file, i) =>
          i === index ? { ...file, data: parsedData } : file
        );
  
        const xValues = parsedData.map(point => point.x);
        const yValues = parsedData.map(point => point.y);
  
        const maxX = Math.max(...xValues);
        const maxY = Math.max(...yValues);
        const minX = Math.min(...xValues);
        const minY = Math.min(...yValues);
  
        const xAxisOptions = {
          ...chartOptions1.xaxis,
          min: minX,
          max: maxX,
        };
  
        const yAxisOptions = {
          ...chartOptions1.yaxis,
          min: minY,
          max: maxY,
        };
  
        setChartOptions({
          ...setChartOptions,
          series: [
            {
              data: parsedData,
            },
          ],
          xaxis: xAxisOptions,
          yaxis: yAxisOptions,
        });
  
        setSelectedFiles(updatedFiles);
      } else {
        console.error(`No valid data points found in ${file.name}.`);
      }
    } else {
      setChartOptions({
        ...setChartOptions,
        series: [
          {
            data: selectedFile.data,
          },
        ],
      });
    }
  };
  

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  };

  const parseDataFile = (data, selectedRadio) => {
    const dataIndex = data.indexOf('Tension;Torsion;Bending moment X;Bending moment Y;Time;Temperature');
  
    if (dataIndex !== -1) {
      const lines = data.slice(dataIndex).split('\n');
      const headersLine = lines[0];
      const headers = headersLine.split(';');
  
      const timeIndex = headers.findIndex((header) => header.includes('Time'));
      let valueIndex;
  
      switch (selectedRadio) {
        case 'Tension':
          valueIndex = headers.findIndex((header) => header.includes('Tension'));
          break;
        case 'Torsion':
          valueIndex = headers.findIndex((header) => header.includes('Torsion'));
          break;
        case 'BendingMomentX':
        default:
          valueIndex = headers.findIndex((header) => header.includes('Bending moment X'));
          break;
      }
  
      const parsedData = lines
        .slice(1)
        .map((line) => {
          const values = line.split(';');
          const xValue = new Date(values[timeIndex] * 1000).getTime();
          const yValue = parseFloat(values[valueIndex]);
  
          if (!isNaN(xValue) && !isNaN(yValue)) {
            return {
              x: xValue,
              y: yValue,
            };
          } else {
            return null;
          }
        })
        .filter(Boolean);
  
      return parsedData;
    } else {
      console.error('Header line not found in the data file.');
      return [];
    }
  };
  
  
  const numLines = 10;
  const generateLines = (files, handleFileClick) => {
    const lines = [];
    for (let i = 0; i < numLines; i++) {
      lines.push(
        <div
          key={i}
          style={{ borderBottom: '1px solid black', height: '40px', display: 'flex', alignItems: 'center', paddingLeft: '10px', backgroundColor: files[i]?.selected ? 'lightblue' : 'white', cursor: 'pointer' }}
          onClick={() => handleFileClick(i)}>
            
          <div>{files[i]?.name || ''}</div>
        </div>
      );
    }
    return lines;
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };


  const clearGraphs = () => {
    setChartOptions1({
      ...chartOptions1,
      series: [], // Clear series data
    });
    setChartOptions2({
      ...chartOptions2,
      series: [], // Clear series data
    });
    setSelectedFileIndex1(null); // Reset selected file index for the first component
    setSelectedFileIndex2(null); // Reset selected file index for the second component
  }; 
  
  const generateReport = () => {
    let reportContent = '';

    if (selectedFiles1[selectedFileIndex1] && graphContainerRef1.current) {
      const file1 = selectedFiles1[selectedFileIndex1];
      reportContent += `File 1 Details:\nName: ${file1.name}\n\n`;
  
      html2canvas(graphContainerRef1.current).then((canvas1) => {
        const imageData1 = canvas1.toDataURL('image/png');
        reportContent += `Graph Snapshot 1:\n${imageData1}\n\n`;
  
        if (selectedFiles2[selectedFileIndex2] && graphContainerRef2.current) {
          const file2 = selectedFiles2[selectedFileIndex2];
          reportContent += `File 2 Details:\nName: ${file2.name}\n\n`;
  
          html2canvas(graphContainerRef2.current).then((canvas2) => {
            const imageData2 = canvas2.toDataURL('image/png');
            reportContent += `Graph Snapshot 2:\n${imageData2}\n\n`;
  
            downloadReport(reportContent);
          }).catch((error) => {
            console.error('Error capturing graph snapshot 2:', error);
          });
        } else {
          downloadReport(reportContent);
        }
      }).catch((error) => {
        console.error('Error capturing graph snapshot 1:', error);
      });
    }
  };
  
  const downloadReport = (content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = 'report.txt';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyImageToClipboard = () => {
    const graphContainers = [graphContainerRef1.current, graphContainerRef2.current]
      .filter(container => container instanceof HTMLElement && document.body.contains(container));
  
    const graphDataAvailable = graphContainers.some((container, index) => {
      const chartOptions = index === 0 ? chartOptions1 : chartOptions2;
      return chartOptions.series && chartOptions.series.length > 0 && chartOptions.series.some(series => series.data && series.data.length > 0);
    });
  
    if (!graphDataAvailable) {
      alert('No graph data found to save.');
      return;
    }
  
    const promises = graphContainers.map(container => {
      return html2canvas(container).then(canvas => {
        return canvas.toDataURL('image/png');
      });
    });
  
    Promise.all(promises)
      .then(imageDataUrls => {
        const pdf = new jsPDF();
  
        imageDataUrls.forEach((imageDataUrl, index) => {
          const imgHeight = 150;
          const imgWidth = 210;
  
          pdf.addImage(imageDataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
  
          if (index !== imageDataUrls.length - 1) {
            pdf.addPage();
          }
        });
  
        pdf.save('graph_images.pdf');
        alert('Images saved to PDF successfully.');
      })
      .catch(error => {
        console.error('Error generating graph snapshots:', error);
      });
  };
  
  
  return (
  <div onClick={stopPropagation}>
    <div style={{flexDirection:'column',width:'80vw',height:'90vh',justifyContent: 'space-between'}}>
     <div style={{display:'flex',flexDirection:'row',justifyContent: 'space-between'}}onClick={stopPropagation}>
  
        <div style={{ height: '50%', width: '30%', border: '1px solid black', padding: '10px', boxSizing: 'border-box', backgroundColor: 'white' }}>
          {/* <h3 style={{ textAlign: 'left', fontWeight: 'bold' }}>First Tool Life Plotting</h3> */}
          <label>Folder of Tool life Files </label>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <label
              htmlFor="folderInput1"
              style={{ display: 'flex', alignItems: 'center', marginRight: '10px', cursor: 'pointer' }}>
              <input type="text" readOnly style={{ marginRight: '5px', padding: '2px', border: '1px solid black' }} />
              <span role="img" aria-label="folder-icon">
                📁
              </span>
            </label>
            <input type="file" id="folderInput1" style={{ display: 'none', border: '2px solid black' }} onChange={handleFileChange} multiple />
          </div>
          <div style={{ marginTop: '10px' }}>    
            <h4 style={{ textAlign: 'left', paddingLeft: '5px' }}>List of Tool Life Files</h4>
            <div style={{ height: '45%', width: '100%', border: '1px solid black', overflowY: 'scroll' }}>
              {/* File list generated dynamically */}
              {generateLines(selectedFiles1, handleFileClick1)}    
            </div>
          </div>
        </div>    
        {/* First Graph Component */}
        <div style={{ width: '60vw', height: '45vh', marginLeft: '10px', backgroundColor: 'white' }}>
          <div style={{ backgroundColor: 'white', fontSize: '15px', fontWeight: 'bold' }}>
            {selectedFileIndex1 !== null && (<p> File Name: {selectedFiles1[selectedFileIndex1]?.name}</p>)}
          </div>
          <ApexCharts ref={graphContainerRef1} options={chartOptions1} series={chartOptions1.series} type="line" height={500} width={1050} />
        </div>
  
      {/* Second File Browsing Component */}
     
        <div style={{ height: '60%', width: '30%', border: '1px solid black', padding: '10px', boxSizing: 'border-box', backgroundColor: 'white' }}>
          <h3 style={{ textAlign: 'left', fontWeight: 'bold' }}>Second Tool Life Plotting</h3> 
          <label>Folder Files </label>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <label
              htmlFor="folderInput2"
              style={{ display: 'flex', alignItems: 'center', marginRight: '10px', cursor: 'pointer' }}>
              <input type="text" readOnly style={{ marginRight: '5px', padding: '2px', border: '1px solid black' }} />
              <span role="img" aria-label="folder-icon">
                📁
              </span>
            </label>
            <input type="file" id="folderInput2" style={{ display: 'none', border: '2px solid black' }} onChange={handleFileChange} multiple />
          </div>
          <div style={{ marginTop: '10px' }}>
            <h4 style={{ textAlign: 'left', paddingLeft: '5px' }}>List of Files in the folder</h4>
            <div style={{ height: '45%', width: '100%', border: '1px solid black', overflowY: 'scroll' }}>
              {/* File list generated dynamically */}
              {generateLines(selectedFiles2, handleFileClick2)}
            </div>
          </div> 
         </div> 
         {/* Second Graph Component */}    
        </div>

        <div  style={{display:"flex",flexDirection:"row",backgroundColor:'white '}}onClick={stopPropagation}>
        <div style={{ width: '60vw', height: '40vh', marginLeft: '10px', backgroundColor: 'white' }}>
          <div style={{ backgroundColor: 'white', fontSize: '15px', fontWeight: 'bold' }}>
            {selectedFileIndex2 !== null && (<p> File Name: {selectedFiles2[selectedFileIndex2]?.name}</p>)}
          </div>
          <ApexCharts ref={graphContainerRef2} options={chartOptions2} series={chartOptions2.series} type="line" height={450} width={1350} />
        </div>
         <div style={{height: '40vh',padding:'15px', backgroundColor: 'white',border:"2px solid black"}}>
 <div class="flex mb-3">
  <div class="mr-6">
    <label class="flex items-center mb-3">To be calculated</label>
    <div onClick={stopPropagation}>
      <div class="bg-gray-300 h-50 w-40">
        <div class="flex items-center mb-3">
          <input id="tension" type="radio" value="Tension"name="default-radio" checked={selectedRadio === 'Tension'} onChange={handleRadioChange}
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label for="tension" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Tension
          </label>
        </div>
        <div class="flex items-center mb-3">
          <input  id="torsion"  type="radio"  value="Torsion" name="default-radio"checked={selectedRadio === 'Torsion'}onChange={handleRadioChange}
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label for="torsion" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Torsion
          </label>
        </div>
        <div class="flex items-center mb-3">
          <input  id="bendingMomentX"type="radio"  value="BendingMomentX" name="default-radio"checked={selectedRadio === 'BendingMomentX'}onChange={handleRadioChange}
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label for="bendingMomentX" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Bending Moment X
          </label>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="flex mb-3">
  <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black -700  font-medium hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
      Cursor on/off
    </button>
  </div>

  <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-medium hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
      Export Graph 
    </button>
  </div>

  <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-medium hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
      Bounds on/off
    </button>
  </div>
</div>

<div class="flex mb-4">

  <div class="mr-4">
    <button onClick={clearGraphs}class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-medium hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
      Clear Graph
    </button>
  </div>

  <div class="mr-4">
    <button  onClick={generateReport} class="w-40 bg-transparent hover:bg-blue-500 text-black-700 font-medium hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"style={{ width: '150px', height: '40px' }}>
      Report
    </button>
  </div>

  <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-medium hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
       offset on/off
    </button>
  </div>
</div>

<div class="flex mb-4">

  <div class="mr-4">
  <button  class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-medium hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"onClick={onClose} style={{ width: '120px', height: '40px' }}>Exit</button>
  </div>

  <div class="mr-4">
    <button onClick={copyImageToClipboard} class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-medium hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
      Image to clipboard
    </button>
  </div>

  <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-medium hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
      Calculate
    </button>
   </div>
   </div>
   </div>
</div>
</div>
</div>
  
  );
};

export default ToolLifePlot;