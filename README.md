# webChronicle

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x+-green.svg)](https://nodejs.org/)
[![Eleventy](https://img.shields.io/badge/Eleventy-3.x-black.svg)](https://www.11ty.dev/)

A self-hosted web archiving tool that captures and explores snapshots of webpages over time—like the Wayback Machine, but as your own personal Time Machine.

**[Live Demo](https://webchronicle.dev/)** | **[Blog Post](https://alex.zappa.dev/blog/webchronicle/)**

## Features

- **Capture website snapshots** — Archive any website with a single command
- **Time travel through history** — Browse previous versions of archived pages
- **Self-hosted & private** — Your archives stay on your own infrastructure
- **Multiple sites support** — Archive multiple domains in a single snapshot
- **Recursive scraping** — Automatically follow links to capture entire sites
- **Overlay navigation** — Injected UI shows archive date and quick navigation

## Quick Start

```bash
# Clone and install
git clone https://github.com/reatlat/webchronicle.git
cd webchronicle
npm install

# Configure your URLs in webchronicle.config.js, then:
npm run scraper    # Capture snapshots
npm run start      # Start local server at http://localhost:8080
```

## Configuration

Edit `webchronicle.config.js` to specify which websites to archive:

```javascript
export default {
  urls: [
    'https://example.com',
    'https://example.org',
  ],
  recursive: true,
  maxRecursiveDepth: 3,
  urlFilter: (url) => {
    return url.startsWith('https://example.com') || url.startsWith('https://example.org');
  },
};
```

Full configuration options available in the [website-scraper documentation](https://github.com/website-scraper/node-website-scraper?tab=readme-ov-file#options).

## Usage

1. Configure your target URLs in `webchronicle.config.js`
2. Run the scraper to capture snapshots:
   ```bash
   npm run scraper
   ```
3. Commit your archives:
   ```bash
   git add ./scraped-websites
   git commit -m "Add website snapshots"
   git push
   ```
4. Deploy or run locally:
   ```bash
   npm run start      # Development
   npm run build      # Production build
   ```

### Snapshot Structure

Each snapshot is stored with a timestamp and organized by domain:

```
scraped-websites/
├── 2024-12-01T01-41-35/
│   ├── example.com/
│   └── example.org/
└── ledger.json
```

## Deployment

Deploy to your preferred platform:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/reatlat/webchronicle)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/reatlat/webchronicle)

Also compatible with Cloudflare Pages, AWS, Heroku, and Google Cloud.

## Tech Stack

- **[Eleventy](https://www.11ty.dev/)** — Static site generator
- **[website-scraper](https://github.com/website-scraper/node-website-scraper)** — Website downloading
- **[TailwindCSS](https://tailwindcss.com/)** — Styling
- **[esbuild](https://esbuild.github.io/)** — JavaScript bundling

## Contributing

1. Fork this repo
2. Clone: `git clone git@github.com:YOUR_USERNAME/webchronicle.git`
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin my-new-feature`
6. Create a Pull Request

Found a bug? [Open an issue](https://github.com/reatlat/webchronicle/issues).

## Credits

Special thanks to [James Dancer](https://www.linkedin.com/in/james-dancer/) for the inspiration behind the name.

Logo design by [Tatiana Zappa](https://tatiana.zappa.art/).

## License

This project is open source and available under the [MIT License](LICENSE).