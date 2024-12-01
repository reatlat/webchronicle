// More options for website-scraper here https://www.npmjs.com/package/website-scraper
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
