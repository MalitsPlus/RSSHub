import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const baseUrl = 'https://technote.qualiarts.jp/';

function getImageUrl(srcset: string): string {
    const items = srcset.split(',\n');
    return items.at(-1)?.split(' ')[0] ?? '';
}

// handler documentation: https://docs.rsshub.app/joinus/new-rss/start-code#via-html
async function handler() {
    const response = await ofetch(baseUrl);
    const $ = load(response);
    // Selecting Elements Guide: https://cheerio.js.org/docs/basics/selecting
    // MDN Spec: https://developer.mozilla.org/en-US/docs/Glossary/CSS_Selector#see_also
    const items = $('main article')
        .toArray() // We use the `toArray()` method to retrieve all the DOM elements selected as an array.
        .map((item) => {
            // We use the `map()` method to traverse the array and parse the data we need from each element.
            const a = $('a[rel="bookmark"]', item).first();
            const t = $('time', item).first();
            const author = $('div > a[rel="author"]', item).toArray();
            const tags = $('ul a[rel="tag"] span', item).toArray();
            const imageRaw = $('picture source', item);
            const imageSet = imageRaw.attr('srcSet') ?? imageRaw.attr('data-srcset')!;
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).toString(), // We need an absolute URL for `link`, but `a.attr('href')` returns a relative URL.
                pubDate: parseDate(t.attr('datetime')!),
                author: author.map((it) => $(it).prop('innerText')).join(', '),
                category: tags.map((it) => $(it).text()),
                image: getImageUrl(imageSet!),
            };
        });

    return {
        // channel title
        title: `QualiArts Engineer Blog`,
        // channel link
        link: `https://technote.qualiarts.jp/article/`,
        // each feed item
        item: items,
    };
}

export const route: Route = {
    path: '/',
    categories: ['programming', 'blog'],
    example: '/',
    // parameters: { user: 'GitHub username', repo: 'GitHub repo name', state: 'the state of the issues. Can be either `open`, `closed`, or `all`. Default: `open`.', labels: 'a list of comma separated label names' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'QualiArts Engineer Blog',
    maintainers: ['Vibbit'],
    handler,
};
