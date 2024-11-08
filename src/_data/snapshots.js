// async read ledger.json from ./scraped-website
import {readFileSync} from 'fs';

let data = {};

try {
    data = readFileSync('./scraped-websites/ledger.json', 'utf8');
} catch (err) {
    console.error(err);
}

export default async function () {
    return {
        raw: JSON.parse(data),
        timestamps: Object.keys(JSON.parse(data)).sort(),
        getByID(id) {
            return JSON.parse(data)[id];
        },
    }
}
