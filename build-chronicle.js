#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import ora from 'ora';

async function copyDirectoryAsync(source, destination) {
    try {
        await fs.mkdir(destination, { recursive: true }); // Create destination directory if it doesn't exist
        const items = await fs.readdir(source); // Get all files and folders in source directory
        for (const item of items) {
            const sourcePath = path.join(source, item);
            const destinationPath = path.join(destination, item);
            const stat = await fs.lstat(sourcePath);
            if (stat.isDirectory()) {
                await copyDirectoryAsync(sourcePath, destinationPath); // Recursively copy directories
            } else {
                await fs.copyFile(sourcePath, destinationPath); // Copy files
            }
        }
    } catch (error) {
        console.error(`Error copying directory "${source}" to "${destination}": ${error.message}`);
    }
}

async function updateHTMLAsync(source) {

}

(async () => {
    const source = './scraped-websites';
    const destination = './_site';

    const rainbow = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

    let i = 0;
    let startTime = Date.now();
    let statusMessage = 'Processing snapshots ...';
    const spinner = ora(statusMessage).start();

    const updateSpinner = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        spinner.color = rainbow[i % rainbow.length];
        spinner.text = `${statusMessage} ${elapsed}s`;
        i++;
    };

    let progressInterval = setInterval(updateSpinner, 1000);

    await copyDirectoryAsync(source, destination);

    // TODO: Update HTML files by adding extra JS for back navigation and other features

    clearInterval(progressInterval);

    spinner.succeed('All folders copied successfully!');
})();
