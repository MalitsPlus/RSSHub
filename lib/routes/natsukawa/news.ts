import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.natsukawashiina.jp/';

// handler documentation: https://docs.rsshub.app/joinus/new-rss/start-code#via-html
async function handler() {
    const response = await ofetch(`https://www.sonymusic.co.jp/json/v2/artist/shiinanatsukawa/information/start/0/count/11/callback/artist_news?callback=artist_news`, {
        headers: {
            Referer: 'https://www.natsukawashiina.jp/',
            'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome/123.0.0.0',
        },
    });
    const data = JSON.parse(response.substring('artist_news('.length, response.length - 1));
    const items = data.items.map((item) => {
        const itemObject = {
            title: item.title,
            link: new URL(item.link, baseUrl).toString(),
            pubDate: parseDate(item.date),
            description: item.article.replaceAll('&nbsp;', ' ').replaceAll('\r\n', '<br/>'),
        };
        return itemObject;
    });

    return {
        // channel title
        title: `夏川椎菜 Official Info`,
        // channel link
        link: `https://www.natsukawashiina.jp/info/`,
        // each feed item
        item: items,
    };
}

export const route: Route = {
    path: '/',
    // categories: ['programming', 'blog'],
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
    name: '夏川椎菜 Official Info',
    maintainers: ['Vibbit'],
    handler,
};
