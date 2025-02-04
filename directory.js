const fs = require('fs');
const path = require('path');

// Function to categorize and move files
const organizeDirectory = (dirPath) => {
  try {
    // Validate if the directory exists
    if (!fs.existsSync(dirPath)) {
      console.error("Error: Directory does not exist.");
      return;
    }

    // Define file type categories
    const fileCategories = {
      Images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
      Documents: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.csv', '.pptx'],
      Videos: ['.mp4', '.avi', '.mkv', '.mov', '.wmv'],
      Others: []
    };

    // Read all files and directories in the specified path
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const itemPath = path.join(dirPath, item);

      // Process files only, ignore directories
      if (fs.lstatSync(itemPath).isFile()) {
        const fileExt = path.extname(item).toLowerCase();
        let category = "Others";

        // Determine file category
        for (const [key, extensions] of Object.entries(fileCategories)) {
          if (extensions.includes(fileExt)) {
            category = key;
            break;
          }
        }

        // Create subfolder if it doesn't exist
        const categoryFolder = path.join(dirPath, category);
        if (!fs.existsSync(categoryFolder)) {
          fs.mkdirSync(categoryFolder);
        }

        // Move the file to the categorized subfolder
        const destPath = path.join(categoryFolder, item);
        fs.renameSync(itemPath, destPath);
        console.log(`Moved: ${item} -> ${category}`);
      }
    });

    console.log("Files organized successfully.");
  } catch (error) {
    console.error("Error organizing directory:", error.message);
  }
};

// Command-line interface for directory input
const inputDir = process.argv[2];
if (inputDir) {
  const absolutePath = path.resolve(inputDir); // Ensure full path
  organizeDirectory(absolutePath);
} else {
  console.error("Usage: node directoryOrganizer.js <directory-path>");
}
