import { makeCruncher } from './make-cruncher';

const MAX_ID_FOR_TESTS = 35;

describe('make-cruncher', () => {
  let cruncher;
  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const logDN = () => {};

    cruncher = makeCruncher({
      loggingService: {
        log: logDN,
        info: logDN,
        error: logDN,
      },
      prismaService: {
        covid_daily_cases_usa: {
          findFirst(query) {
            return Promise.resolve({
              id: MAX_ID_FOR_TESTS,
            });
          },
        },
      },
      ROWS_PER_CHUNK: 10,
    });
  });

  it('should be defined', () => {
    expect(cruncher).toBeDefined();
  });

  describe('.fetchMaxId', () => {
    it('should set the maxId', async () => {
      expect.assertions(1);

      await cruncher.$do.fetchMaxId();
      expect(cruncher.value.maxId).toBe(MAX_ID_FOR_TESTS);
    });

    it('should make chunks', async () => {
      expect.assertions(4);

      await cruncher.$do.fetchMaxId();

      expect(cruncher.value.chunks.get(0).max).toBe(9);
      expect(cruncher.value.chunks.get(10).max).toBe(19);
      expect(cruncher.value.chunks.get(20).max).toBe(29);
      expect(cruncher.value.chunks.get(30).max).toBe(39);
    });
  });
});
