const fs = require('fs');
const path = require('path');
const archiver = require('archiver'); // Optional for compression

// Function to copy files to the backup folder
const backupFiles = (sourceDir, backupDir, compress = false) => {
  try {
    // Check if the source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.error("Error: Source directory does not exist.");
      return;
    }

    // Ensure the backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const logDetails = [];

    // Recursive function to copy files and maintain directory structure
    const copyFilesRecursively = (currentSource, currentBackup) => {
      const items = fs.readdirSync(currentSource);

      items.forEach((item) => {
        const sourcePath = path.join(currentSource, item);
        const backupPath = path.join(currentBackup, item);

        if (fs.lstatSync(sourcePath).isDirectory()) {
          // Create the directory in the backup folder
          if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath);
          }
          // Recursively copy files from the subdirectory
          copyFilesRecursively(sourcePath, backupPath);
        } else {
          // Copy the file
          fs.copyFileSync(sourcePath, backupPath);

          // Get file details
          const { size, birthtime } = fs.statSync(sourcePath);
          logDetails.push({
            file: sourcePath,
            backupPath,
            size: `${size} bytes`,
            timestamp: birthtime,
          });

          console.log(`Backed up: ${sourcePath} -> ${backupPath}`);
        }
      });
    };

    // Start the backup process
    copyFilesRecursively(sourceDir, backupDir);

    // Write the log details to backup-log.txt
    const logFilePath = path.join(backupDir, 'backup-log.txt');
    const logContent = logDetails
      .map(
        (log) =>
          `File: ${log.file}\nBackup Path: ${log.backupPath}\nSize: ${log.size}\nTimestamp: ${log.timestamp}\n`
      )
      .join('\n');
    fs.writeFileSync(logFilePath, logContent);
    console.log("Backup completed and logged.");

    // Optional: Compress the backup folder
    if (compress) {
      compressBackupFolder(backupDir);
    }
  } catch (error) {
    console.error("Error during backup:", error.message);
  }
};
// Function to compress the backup folder into a .zip file
const compressBackupFolder = (backupDir) => {
  try {
    const output = fs.createWriteStream(`${backupDir}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Backup compressed into ${backupDir}.zip (${archive.pointer()} total bytes)`);
    });
    archive.on('error', (err) => {
      throw err;
    });
    archive.pipe(output);
    archive.directory(backupDir, false);
    archive.finalize();
  } catch (error) {
    console.error("Error during compression:", error.message);
  }
};
// Command-line interface for backup tool
const sourceDir = process.argv[2]; // First argument: source directory
const backupDir = process.argv[3]; // Second argument: backup directory
const compressFlag = process.argv[4] === '--compress'; // Optional third argument: --compress

if (sourceDir && backupDir) {
  const absoluteSource = path.resolve(sourceDir);
  const absoluteBackup = path.resolve(backupDir);
  backupFiles(absoluteSource, absoluteBackup, compressFlag);
} else {
  console.error("Usage: node fileBackupSystem.js <source-folder> <backup-folder> [--compress]");
}