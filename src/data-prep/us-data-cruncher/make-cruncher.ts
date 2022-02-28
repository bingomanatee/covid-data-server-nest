import { Mirror } from '@wonderlandlabs/mirror';
import { makeCruncherChunk } from './make-cruncher-chunk';

export function makeCruncher(params): any {
  return new Mirror(
    {
      maxId: null,
    },
    {
      mutable: true,
      assets: params,
      actions: {
        async fetchMaxId(mir) {
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
          let start = 0;
          do {
            const max = start + mir.$assets.ROWS_PER_CHUNK - 1;
            mir.$do.makeChunk(start, max);
            start += mir.$assets.ROWS_PER_CHUNK;
          } while (start <= mir.value.maxId);
        },

        makeChunk(mir, start, max) {
          try {
            mir.$children
              .get('chunks')
              .$addChild(start, makeCruncherChunk(mir.$assets, start, max));
          } catch (err) {
            console.log('error makeChunk:', start, max, err);
          }
        },
      },
      children: {
        chunks: new Map(),
      },
    },
  );
}
