import { makeCruncher } from './make-cruncher';

const MAX_ID_FOR_TESTS = 35000;

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

  describe('.getMaxId', async () => {
    it('should set the maxId', async () => {
      console.log('---- setting max id');
      expect.assertions(1);

      await cruncher.$do.getMaxId();
      expect(cruncher.value.maxId).toBe(MAX_ID_FOR_TESTS);
      console.log('---- value of cruncher:', cruncher.value);
    });
  });
});
