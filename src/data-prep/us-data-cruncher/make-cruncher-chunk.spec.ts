import { makeCruncherChunk } from './make-cruncher-chunk';
import mock = jest.mock;

const CHUNK_START = 10;
const CHUNK_MAX = 19;

const mockResults = [
  {
    date_published: '2021-12-31T00:00:00',
  },
  {
    date_published: '2021-12-31T00:00:00',
  },
  {
    date_published: '2022-01-01T00:00:00',
  },
];

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

    it('should set loadStatus', async () => {
      expect.assertions(1);
      await chunk.$do.loadRows();

      const dayOffsets = chunk.value.rows.map((row) => row.dayNum);

      console.log('--- dayOffsets', dayOffsets);

      expect(dayOffsets).toEqual([730, 730, 731]);
    });
  });
});
