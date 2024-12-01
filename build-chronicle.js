#!/usr/bin/env node
import {promises as fs} from 'fs';
import path from 'path';
import ora from 'ora';
import { DateTime } from 'luxon';
import * as cheerio from 'cheerio';

async function copyDirectoryAsync(source, destination) {
    try {
        await fs.mkdir(destination, {recursive: true}); // Create destination directory if it doesn't exist
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

async function findHtmlFiles(dir, htmlFiles = []) {
    const files = await fs.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
            // Recurse into subdirectory
            await findHtmlFiles(filePath, htmlFiles);
        } else if (path.extname(file).toLowerCase() === '.html') {
            // Add .html file to the array
            htmlFiles.push(filePath);
        }
    }

    return htmlFiles;
}

async function updateHTMLAsync(destinationSource) {
    try {
        const htmlFiles = await findHtmlFiles(destinationSource);
        if (htmlFiles.length > 0) {
            for (const file of htmlFiles) {
                const html = await fs.readFile(file, 'utf8');
                const $ = cheerio.load(html);
                const snapshotDomain = file.split('/')[3];
                const snapshotDate =  DateTime.fromISO(file.split('/')[2].replace(/(\d{2})-(\d{2})-(\d{2})$/, '$1:$2:$3')).toFormat("MMMM d, yyyy 'at' h:mma");
                $('[href^="/"]').each((index, element) => {
                    $(element).attr('href', `https://${snapshotDomain}/${$(element).attr('href').replace(/^\//, '')}`);
                });
                if (!$('#webChronicle').length) {
                    $('body')
                        .append(`\n<!--\n    webChronicle | https://webchronicle.dev/ \n    File archived on ${snapshotDate}\n-->\n`)
                        .append(`<script id="webChronicle" data-timestamp="${file.split('/')[2]}" data-domain="${snapshotDomain}" data-file="${file.split('/').slice(3).join('/')}" src="/js/webchronicle.js"></script>`);
                }
                await fs.writeFile(file, $.html());
            }
        }
    } catch (error) {
        console.error(`Error updating HTML files in "${destinationSource}": ${error.message}`);
    }
}

(async () => {
    const source = './scraped-websites';
    const destination = './_site/snapshots';

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

    statusMessage = 'Updating HTML files ...';

    clearInterval(progressInterval);

    statusMessage = 'Updating HTML files ...';

    progressInterval = setInterval(updateSpinner, 1000);

    await updateHTMLAsync(destination);

    clearInterval(progressInterval);

    const success_elapsed = Math.floor((Date.now() - startTime) / 1000);

    spinner.succeed(`All snapshots copied successfully in ${success_elapsed}s`);
})();
