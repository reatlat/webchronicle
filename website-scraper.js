#!/usr/bin/env node

import config from './webchronicle.config.js';
import scrape from 'website-scraper';
import ora from 'ora';
import { readdirSync, writeFileSync, readFileSync } from 'fs';

(async () => {

    let statusMessage = 'Scraping website(s) ...';

    const time = new Date().toISOString()
        .replace(/\..+/, '')
        .replace(/:/g, '-');

    // check if config.sitemaps is an array and not empty
    if (!Array.isArray(config.urls) || !config.urls.length) {
        throw new Error('webchronicle.config.js: urls must be an array with at least one URL');
    }

    // Options for website-scraper https://www.npmjs.com/package/website-scraper
    const options = {
        ...config,
        directory: `./scraped-websites/${time}`,
    };

    ora(`Snapshots of websites will be captured: ${config.urls.join(', ')}`).info();

    const rainbow = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
    let i = 1;
    let startTime = Date.now();

    let spinner = ora(statusMessage).start();

    let progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000); // elapsed time in seconds
        spinner.color = rainbow[i % rainbow.length];
        spinner.text = `${statusMessage} ${elapsed}s`;
        i++;
    }, 1000);

    await scrape(options);

    clearInterval(progressInterval);

    const downloaded_elapsed = Math.floor((Date.now() - startTime) / 1000); // total elapsed time in seconds

    spinner.succeed(`Website(s) successfully downloaded in ${downloaded_elapsed}s`);

    statusMessage = 'Updating ledger ...';
    i = 1;
    startTime = Date.now();
    spinner = ora(statusMessage).start();
    progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000); // elapsed time in seconds
        spinner.color = rainbow[i % rainbow.length];
        spinner.text = `${statusMessage} ${elapsed}s`;
        i++;
    }, 1000);

    const timeFolders = readdirSync('./scraped-websites', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const returnJSON = timeFolders.reduce((acc, folder) => {
        // read folder for subfolder
        const urls = readdirSync(`./scraped-websites/${folder}`, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(url => {
                try {
                    readFileSync(`./scraped-websites/${folder}/${url}/index.html`, 'utf8');
                    return true;
                } catch {
                    return false;
                }
            });

        acc[folder] = {
            time: folder,
            urls: urls
        };
        return acc;
    }, {});

    writeFileSync('./scraped-websites/ledger.json', JSON.stringify(returnJSON, null, 2));

    clearInterval(progressInterval);
    const ledger_elapsed = Math.floor((Date.now() - startTime) / 1000); // total elapsed time in seconds
    spinner.succeed(`Ledger successfully updated in ${ledger_elapsed}s`);

})();
