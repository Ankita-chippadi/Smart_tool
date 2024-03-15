import React, { useState } from 'react';

const MyTable = ({ onBoundsButtonClick: propOnBoundsButtonClick }) => {
  const [digits, setDigits] = useState(0);
  const [boundsOptionsVisible, setBoundsOptionsVisible] = useState(false);

  const handleBoundsButtonClick = () => {
    setBoundsOptionsVisible(!boundsOptionsVisible);
    // Call the provided callback to notify the parent component about the button click
    propOnBoundsButtonClick(!boundsOptionsVisible);
  };

    return (
    <div className="mx-left max-w-md border p-4 flex flex-col">
            <div className="font-bold text-black pr-4">Statistics</div>
      <div className="border border-black mb-4 p-4">
        <div className="flex flex-row mb-2">
          
          <div className="flex-grow"></div>
        </div>
        <table className="border-collapse w-full">
          <thead>
            <tr className="bg-gray-200">
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
              <td className="p-2 border-r"></td>
              <td className="p-2 border-r"></td>
              <td className="p-2 border-r"></td>
              <td className="p-2"></td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold border-r text-black">Torsion</td>
              <td className="p-2 border-r"></td>
              <td className="p-2 border-r"></td>
              <td className="p-2 border-r"></td>
              <td className="p-2"></td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold border-r text-black">Bending Moment Y</td>
              <td className="p-2 border-r"></td>
              <td className="p-2 border-r"></td>
              <td className="p-2 border-r"></td>
              <td className="p-2"></td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-bold border-r text-black">Temperature</td>
              <td className="p-2 border-r"></td>
              <td className="p-2 border-r"></td>
              <td className="p-2 border-r"></td>
              <td className="p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="flex flex-row justify-end">
      <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700 cursor-pointer"
          onClick={handleBoundsButtonClick}
        >
          View Bounds
        </button>

        <div className="relative">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700 cursor-pointer"
           
          >
            Bounds
          </button>

          {boundsOptionsVisible && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded shadow">
              <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                Bounds
              </button>
              <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                Cut
              </button>
              <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                Clear Offset
              </button>
              <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                Drift Compensation
              </button>
            </div>
          )}
        </div>

        <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700 cursor-pointer">
          Calculate Values
        </button>

        <div className="flex flex-col items-end ml-2">
          <label className="text-gray-400 mb-1">Digits:</label>
          <input
            className="p-2 border border-gray-400 rounded w-16"
            type="number"
            value={digits}
            onChange={(e) => setDigits(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
    </div>
  );
};

export default MyTable;