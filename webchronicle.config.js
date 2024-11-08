// More options for website-scraper here https://www.npmjs.com/package/website-scraper
export default {
    urls : [
        'https://example.com',
    ],
    recursive : true,
    maxRecursiveDepth : 3,
    filenameGenerator : 'bySiteStructure',
    prettifyUrls : true,
    urlFilter : (url) => {
        return url.startsWith('https://example.com');
    },
}
