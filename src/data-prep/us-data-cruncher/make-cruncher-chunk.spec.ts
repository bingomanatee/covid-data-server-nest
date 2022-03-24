import { makeCruncherChunk } from './make-cruncher-chunk';
import mock = jest.mock;
import { DAY_ZERO } from '../constants';

const CHUNK_START = 10;
const CHUNK_MAX = 19;

let _id = 0;
function mockData(dayOff, uid, deaths, confirmed, recovered) {
  const out = {
    id: ++_id,
    uid,
    deaths,
    confirmed,
    recovered,
  };

  // @ts-ignore
  out.date_published = DAY_ZERO.add(dayOff, 'day').toISOString();

  return out;
}

const UID_1 = 1200;

const mockResults = [
  mockData(700, UID_1, 50, 0, 200),
  mockData(701, UID_1, 100, 30, 800),
  mockData(702, UID_1, 120, 35, 1200),
];

console.log('mockResults', mockResults);

describe('make-cruncher-chunk', () => {
  let chunk;
  let assets;
  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const logDN = () => {};

    assets = {
      loggingService: {
        log: logDN,
        info: logDN,
        error: logDN,
      },
      prismaService: {
        covid_daily_cases_usa: {},
      },
    };

    chunk = makeCruncherChunk(assets, CHUNK_START, CHUNK_MAX);
  });

  it('should be defined', () => {
    expect(chunk).toBeDefined();
  });

  describe('.loadRows', () => {
    let passedQuery;
    beforeEach(() => {
      chunk.$assets.prismaService.covid_daily_cases_usa.find = (query) => {
        passedQuery = query;
        return Promise.resolve(mockResults);
      };
    });

    it('should set loadStatus', async () => {
      expect.assertions(1);

      await chunk.$do.loadRows();

      expect(chunk.value.loadStatus).toBe('loaded');
    });

    it('should summarize data', async () => {
      expect.assertions(1);
      await chunk.$do.loadRows();

      expect(chunk.$do.pdRows()).toEqual([
        [
          ['uid', 'stat', 700, 701, 702],
          [1200, 'deaths', 50, 100, 120],
          [1200, 'recovered', 200, 800, 1200],
          [1200, 'confirmed', 0, 30, 35],
        ],
      ]);
    });
  });
});
