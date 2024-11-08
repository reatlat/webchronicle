// More options for website-scraper here https://www.npmjs.com/package/website-scraper
export default {
    urls : [
        'https://freshjuice.dev/',
        'https://alex.zappa.dev/',
    ],
    recursive : true,
    maxRecursiveDepth : 2,
    filenameGenerator : 'bySiteStructure',
    prettifyUrls : true,
    urlFilter : (url) => {
        return url.startsWith('https://freshjuice.dev/') || url.startsWith('https://alex.zappa.dev/');
    },
}
