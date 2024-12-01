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

    const style = document.createElement('style');
    style.innerHTML = `
        .webChronicle {
            user-select: none;
            position: fixed;
            bottom: 30px;
            left: 30px;
            background-color: rgba(0, 0, 0, 0.5) !important;
            color: #fff !important;
            padding: 8px 16px;
            font-size: 10px;
            font-family: monospace;
            display: flex;
            flex-direction: column;
            gap: 4px;
            border-radius: 4px;
            z-index: 100500;
            filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
            backdrop-filter: blur(5px); /* Adds the blur effect */
        }
        .webChronicle * {
            color: #fff;
            text-decoration: none;
        }
        .webChronicle a {
            color: #fff;
            text-decoration: none;
        }
        .webChronicle a:hover {
            color: #fff;
            text-decoration: none;
        }
        .webChronicle__home {
            display: inline-flex;
            align-items: center;
            width: fit-content;
        }
        .webChronicle__home span {
            font-size: 16px;
            margin-right: 6px;
            transition: transform 0.2s;
        }
        .webChronicle__home:hover span {
            transform: translateX(-4px);
        }
        .webChronicle__close {
            cursor: pointer;
            padding: 4px;
            position: absolute;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            top: 6px;
            right: 6px;
            width: 20px;
            height: 20px;
            border-radius: 20px;
            font-size: 16px;
        }
        .webChronicle__close:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
    `;

    document.head.appendChild(style);

    const webChronicleDiv = document.createElement('div');
    webChronicleDiv.classList.add('webChronicle');
    webChronicleDiv.innerHTML = `
        <a href="#" class="webChronicle__close">&#215;</a>
        <a href="/" class="webChronicle__home" title="Back to webChronicle"><span>&#8592;</span>webChronicle</a>
        <span>File archived on ${DateTime.fromISO(timestamp.replace(/(\d{2})-(\d{2})-(\d{2})$/, '$1:$2:$3')).toFormat("MMMM d, yyyy 'at' h:mma")}</span>
    `;
    document.body.appendChild(webChronicleDiv);

    const close = document.querySelector('.webChronicle__close');
    close.addEventListener('click', (e) => {
        e.preventDefault();
        webChronicleDiv.remove();
    });

}, { once: true });
