// More options for website-scraper here https://github.com/website-scraper/node-website-scraper?tab=readme-ov-file#options
export default {
    urls : [
        'https://example.com',
        'https://example.org',
    ],
    recursive : true,
    maxRecursiveDepth : 3,
    filenameGenerator : 'bySiteStructure',
    prettifyUrls : true,
    urlFilter : (url) => {
        return url.startsWith('https://example.com') || url.startsWith('https://example.org');
    },
}
