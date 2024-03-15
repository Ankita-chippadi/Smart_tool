import React, { useState, useEffect, useRef } from 'react';
import PolarPlot from './PolarPlot';
import PolarPlotStacking from './PolarPlotStacking' ;
import GraphicPolarPlotCalculation from './GraphicPolarPlotCalculation';
import ToolLifePlot from './ToolLifePlot';
import LineGraph from './LineGraph';


const Navbar = () => {
  const [fileMenuOpen, setFileMenuOpen] = useState(false);     
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [processMenuOpen, setProcessMenuOpen] = useState(false);
  const [lineMenuOpen, setLineMenuOpen] = useState(false);
  const [compareMenuOpen, setCompareMenuOpen] = useState(false);
  const [polarPlotVisible, setPolarPlotVisible] = useState(false);
  const [polarPlotStackingVisible, setPolarPlotStackingVisible] = useState(false);
  const [graphicPolarPlotCalculationVisible, setGraphicPolarPlotCalculationVisible] = useState(false);
  const [isOtherWindowOpen, setOtherWindowOpen] = useState(false);
  const [ToolLifePlotVisible,setToolLifePlotVisible] =useState(false);

  

  const fileMenuRef = useRef(null);
  const productMenuRef = useRef(null);

  const handlePolarPlotClick = (e) => {
    e.stopPropagation(); // Prevent click propagation to the document
  };
  
  const handlePolarPlotStackingClick = (e) => {
    e.stopPropagation(); // Prevent click propagation to the document
  };

  const handleGraphicPolarPlotCalculationClick = (e) => {
    e.stopPropagation(); // Prevent click propagation to the document
  };

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (
        fileMenuRef.current &&
        !fileMenuRef.current.contains(e.target) &&
        productMenuRef.current &&
        !productMenuRef.current.contains(e.target)
      ) {
        setFileMenuOpen(false);
        setReportMenuOpen(false);
        setProductMenuOpen(false);
        setProcessMenuOpen(false);
        setLineMenuOpen(false);
        setCompareMenuOpen(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const toggleFileMenu = () => {
    setFileMenuOpen(!fileMenuOpen);
  };

  const toggleReportMenu = () => {
    setReportMenuOpen(!reportMenuOpen);
  };

  const toggleProductMenu = () => {
    setProductMenuOpen(!productMenuOpen);
  };

  const toggleProcessMenu = () => {
    setProcessMenuOpen(!processMenuOpen);
  };

  const toggleLineMenu = () => {
    setLineMenuOpen(!lineMenuOpen);
  };

  const toggleCompareMenu = () => {
    setCompareMenuOpen(!compareMenuOpen);
  };

  const togglePolarPlot = () => {
    setPolarPlotVisible(!polarPlotVisible);
    setOtherWindowOpen(!polarPlotVisible); // Toggle the isOtherWindowOpen state
  };

  const closePolarPlot = () => {
    setPolarPlotVisible(false);
    setOtherWindowOpen(false); // Close the other window
  };

  const togglePolarPlotStacking = () => {
    setPolarPlotStackingVisible(!polarPlotStackingVisible);
    setOtherWindowOpen(!polarPlotStackingVisible);
  };

  const closePolarPlotStacking = () => {
    setPolarPlotStackingVisible(false);
    setOtherWindowOpen(!polarPlotStackingVisible);
   
  };

  const toggleGraphicPolarPlotCalculation = () => {
    setGraphicPolarPlotCalculationVisible(!graphicPolarPlotCalculationVisible);
    setOtherWindowOpen(!graphicPolarPlotCalculationVisible);
  };

  const closeGraphicPolarPlotCalculation = () => {
    setGraphicPolarPlotCalculationVisible(false);
    setOtherWindowOpen(!graphicPolarPlotCalculationVisible);

  };

  const toggleToolLifePlot = () => {
    setToolLifePlotVisible(!ToolLifePlotVisible);
    setOtherWindowOpen(!ToolLifePlotVisible);
  };

  const closeToolLifePlot = () => {
    setToolLifePlotVisible(false);
    setOtherWindowOpen(!ToolLifePlotVisible);
  };


  const [fileData, setFileData] = useState([]);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const content = e.target.result;
      setFileData(content); // Set the file content as a string
      // togglePolarPlot();
    };
    
  
    reader.readAsText(uploadedFile);
  };

  const importRawFile = () => {
    // Programmatically trigger the file input click
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
  };




  return (
    <div>
    <nav className="bg-[#03045E]">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="relative group" ref={fileMenuRef}>
          <a href="#" className="text-white group-hover:text-red-700" onClick={toggleFileMenu}>
            File
          </a>
          {fileMenuOpen && (
            <div className="absolute left-11 top-0 mt-2 space-y-2 bg-red-800 text-white">
              <a href="#" className="block px-4 py-2" onClick={importRawFile}>
                Import Raw File
              </a>
              <a href="#" className="block px-4 py-2">Export Raw File</a>
              <div className="relative group">
                <a href="#" className="block px-4 py-2 group-hover:text-gray-300" onClick={toggleReportMenu}>
                  Create Report
                </a>
                {reportMenuOpen && (
                  <div className="absolute left-20 top-0 mt-2 space-y-2 bg-gray-800 text-white">
                    <a href="#" className="block px-4 py-2">With Metric Units</a>
                    <a href="#" className="block px-4 py-2">With Imperial Units</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Polar Plot element */}
        <div className="relative group" id="polarPlotElement" onClick={togglePolarPlot}>
          <a href="#" className="text-white group-hover:text-red-700">
            Polar Plot
          </a>

          {polarPlotVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={handlePolarPlotClick}>
                 <input type="file" id="fileInput" style={{ display: 'none' }} accept=".txt" onChange={handleFileUpload} />
                  {fileData.length > 0 && (
                  <PolarPlot isVisible={polarPlotVisible} onClose={closePolarPlot} fileData={fileData} />
                  )}
            </div>
          )}
        </div>



        {/* Polar Plot Stacking element */}
        <div className="relative group" id="polarPlotStackingElement" onClick={togglePolarPlotStacking}>
          <a href="#" className="text-white group-hover:text-red-700">
            Polar Plot stacking
          </a>

          {polarPlotStackingVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={handlePolarPlotStackingClick}>
                 <input type="file" id="fileInput" style={{ display: 'none' }} accept=".txt" onChange={handleFileUpload} />
                  
                  <PolarPlotStacking isVisible={polarPlotStackingVisible} onClose={closePolarPlotStacking}  />
                  
            </div>
          )}
        </div>



        {/* Graphic Polar Plot Calculation element */}
          <div className="relative group" onClick={toggleGraphicPolarPlotCalculation}>
          <a href="#" className="text-white group-hover:text-red-700">
            Graphic Polar Plot Calculation
          </a>
        </div>
        {graphicPolarPlotCalculationVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            {/* Render the GraphicPolarPlotCalculation component */}
            <GraphicPolarPlotCalculation isVisible={graphicPolarPlotCalculationVisible} onClose={closeGraphicPolarPlotCalculation} />
          </div>
        )}


        {/* toollifeplot */}
            {/* Tool Life stacking */}
            <div className="relative group" onClick={toggleToolLifePlot}>
          <a href="#" className="text-white group-hover:text-red-700">
           Tool Life Plotting 
          </a>

          {ToolLifePlotVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
               {/* <input type="file" id="fileInput" style={{ display: 'none' }} accept=".txt" onChange={handleFileUpload} />
                  {fileData.length > 0 && ( */}
               <ToolLifePlot isVisible={ToolLifePlotVisible} onClose={closeToolLifePlot} fileData={fileData}/> 
         
                   {/* )} */}   
            </div>
          )}
           </div>



        <div className="relative group" ref={productMenuRef}>
          <a href="#" className="text-white group-hover:text-red-700" onClick={toggleProductMenu}>
            Graph Setting
          </a>
          {productMenuOpen && (
            <div className="absolute left-28 top-0 mt-2 space-y-2 bg-red-800 text-white">
              <a href="#" className="block px-4 py-2">Show Grid</a>
              <div className="relative group">
                <a href="#" className="block px-4 py-2 group-hover:text-gray-300" onClick={toggleProcessMenu}>
                  Processing Modus
                </a>
                {processMenuOpen && (
                  <div className="absolute left-28 top-0 mt-2 space-y-2 bg-gray-800 text-white" onClick={toggleLineMenu}>
                    <a href="#" className="block px-4 py-2">Line Width</a>
                    {lineMenuOpen && (
                      <div className="absolute left-20 top-0 mt-2 space-y-2 bg-gray-800 text-white">
                        <a href="#" className="block px-4 py-2">Type 1</a>
                        <a href="#" className="block px-4 py-2">Type 2</a>
                        <a href="#" className="block px-4 py-2">Type 3</a>
                        <a href="#" className="block px-4 py-2">Type 4</a>
                        <a href="#" className="block px-4 py-2">Type 5</a>
                      </div>
                    )}
                  </div>
                )}
                <div className="relative group">
                  <a href="#" className="block px-4 py-2 group-hover:text-gray-300" onClick={toggleCompareMenu}>
                    Comparing Modus
                  </a>
                  {compareMenuOpen && (
                    <div className="absolute left-28 top-0 mt-2 space-y-2 bg-gray-800 text-white" onClick={toggleLineMenu}>
                      <a href="#" className="block px-4 py-2">Line Width</a>
                      {lineMenuOpen && (
                        <div className="absolute left-20 top-0 mt-2 space-y-2 bg-gray-800 text-white">
                          <a href="#" className="block px-4 py-2">Type 1</a>
                          <a href="#" className="block px-4 py-2">Type 2</a>
                          <a href="#" className="block px-4 py-2">Type 3</a>
                          <a href="#" className="block px-4 py-2">Type 4</a>
                          <a href="#" className="block px-4 py-2">Type 5</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Hidden file input */}
        <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>
    </nav>
    <div className="mx-auto mt-8" >
 
       <LineGraph data={fileData} isOtherWindowOpen={isOtherWindowOpen} />
       {isOtherWindowOpen && <PolarPlot onClose={() => setOtherWindowOpen(false)} />}
       {isOtherWindowOpen && <GraphicPolarPlotCalculation onClose={() => setOtherWindowOpen(false)} />}
       <div style={{ position: 'absolute', top: '400px', right: '250px' }}>
      
      </div> 
     </div>

    </div>
  );
}

export default Navbar;
