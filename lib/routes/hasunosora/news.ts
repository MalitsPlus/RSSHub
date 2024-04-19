import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const baseUrl = 'https://www.lovelive-anime.jp/hasunosora/news/';

// handler documentation: https://docs.rsshub.app/joinus/new-rss/start-code#via-html
async function handler() {
    const response = await ofetch(baseUrl);
    const $ = load(response);
    // Elements Selecting Guide: https://cheerio.js.org/docs/basics/selecting
    // MDN Spec: https://developer.mozilla.org/en-US/docs/Glossary/CSS_Selector#see_also
    const items = $('body article div.list__content li')
        .toArray() // We use the `toArray()` method to retrieve all the DOM elements selected as an array.
        .map((item) => {
            // We use the `map()` method to traverse the array and parse the data we need from each element.
            const a = $('a', item);
            const date = $('span.list--date', a).text();
            const category = $('span.list--category', a).text();
            const title = $('span.list--text', a).text();
            return {
                title: `[${category}] ${title}`,
                link: new URL(a.attr('href')!, baseUrl).toString(), // We need an absolute URL for `link`, but `a.attr('href')` returns a relative URL.
                pubDate: parseDate(date),
                category: [category],
            };
        });

    return {
        // channel title
        title: `蓮ノ空 Official Info`,
        // channel link
        link: `https://www.lovelive-anime.jp/hasunosora/news/`,
        // each feed item
        item: items,
    };
}

export const route: Route = {
    path: '/',
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
    name: '蓮ノ空 Official Info',
    maintainers: ['Vibbit'],
    handler,
};
