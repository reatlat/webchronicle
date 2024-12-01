// More options for website-scraper here https://github.com/website-scraper/node-website-scraper?tab=readme-ov-file#options
export default {
    urls : [
        'https://alex.zappa.dev/',
        'https://www.zachleat.com/',
        'https://freshjuice.dev/',
    ],
    recursive : true,
    filenameGenerator : 'bySiteStructure',
    prettifyUrls : true,
    urlFilter : (url) => {
        return url.startsWith('https://alex.zappa.dev') || url.startsWith('https://www.zachleat.com') || url.startsWith('https://freshjuice.dev');
    },
}
