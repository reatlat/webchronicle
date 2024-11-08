# webChronicle
A web archiving tool that captures and explores snapshots of webpages over time, similar to the Wayback Machine.

Live Demo: [webChronicle](https://webchronicle.dev/)

- Requires Node.js 20.x or later
- Each snapshot is stored in a separate folder with the following structure:
  - `YYYY-MM-DDTHH-MM-SS` (timestamp)
    - `example.com` (domain)

## Run Locally

After cloning the repository, install the dependencies:

```bash
npm install
npm run scraper
npm run start
```

## Deployment

You can deploy the project to Netlify by clicking the button below:

[![Netlify Deploy](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/reatlat/webchronicle)

You can also deploy the project to Vercel by clicking the button below:

[![Vercel Deploy](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/reatlat/webchronicle)

You also may deploy this project to other platforms like Heroku, AWS, Cloudflare Pages or Google Cloud.

## Contributing

If you notice an issue, feel free to [open an issue](https://github.com/reatlat/webchronicle/issues).

1. Fork this repo
2. Clone `git clone git@github.com:reatlat/webchronicle.git`
3. Create your feature branch `git checkout -b my-new-feature`
4. Commit your changes `git commit -am 'Add some feature'`
5. Push to the branch `git push origin my-new-feature`
6. Create a new Pull Request
7. Sit back and enjoy your cup of coffee ☕️

## License

This project is open source and available under the [MIT License](LICENSE).