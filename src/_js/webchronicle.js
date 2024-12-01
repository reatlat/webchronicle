import { DateTime } from "luxon";

window.addEventListener('DOMContentLoaded', () => {

    console.log('webchronicle.js loaded');

    const webChronicle = document.getElementById('webChronicle');
    const timestamp = webChronicle.getAttribute('data-timestamp');
    const domain = webChronicle.getAttribute('data-domain');
    const file = webChronicle.getAttribute('data-file');

    console.log('File archived on:', DateTime.fromISO(timestamp.replace(/(\d{2})-(\d{2})-(\d{2})$/, '$1:$2:$3')).toFormat("MMMM d, yyyy 'at' h:mma"));

    const hrefs = document.querySelectorAll('[href^="/"]');
    hrefs.forEach((href) => {
        href.setAttribute('href', `https://${domain}/${href.getAttribute('href').replace(/^\//, '')}`);
    });

}, { once: true });
