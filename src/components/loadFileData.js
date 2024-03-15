// Define the loadFileData function
// const loadFileData = (filename) => {
//     // Implementation of the function
//   };
  
//   // Export the function if it needs to be used in other modules
//   export { loadFileData };
const loadFileData = async (filename) => {
  try {
    // Assuming the file path is relative to the public directory
    const response = await fetch(`/src/components/${filename}`); // Adjust the path as needed

    if (!response.ok) {
      throw new Error(`Failed to load file data. Status: ${response.status}`);
    }

    // Parse the response text
    const data = await response.text();

    return data;
  } catch (error) {
    console.error('Error loading file data:', error.message);
    return null;
  }
};

// Export the function
export { loadFileData };