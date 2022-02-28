import { Mirror } from '@wonderlandlabs/mirror';

const ROWS_PER_CHUNK = 2000;

export function makeCruncher(params) {
  new Mirror(
    {
      maxId: null,
    },
    {
      assets: params,
      actions: {
        async getMaxId(mir) {
          await mir.$assets.prismaService.covid_daily_cases_usa
            .findFirst({
              orderBy: { id: 'desc' },
            })
            .then((record) => {
              mir.$do.readMaxId(record);
              mir.$do.makeChunks();
            })
            .catch((err) => {
              mir.$assets.loggingService.error(
                'cannot get last daily cases usa record: %s',
                err.message,
              );
            });
        },
        readMaxId(mir, lastRecord) {
          mir.$do.setMaxId(lastRecord.id);
        },
        makeChunks(mir) {
          const start = 0;
          do {
            const max = start + ROWS_PER_CHUNK - 1;
            mir.$do.makeChunk(start, max);
          } while (start <= mir.value.maxId);
        },

        makeChunk(mir, start, max) {
          mir.$children.chunks.adChild(
            start,
            new Mirror({
              start,
              max,
            }),
          );
        },
      },
      children: {
        chunks: new Map(),
      },
    },
  );
}
