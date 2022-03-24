import { Mirror } from '@wonderlandlabs/mirror';
import PlaceData from '../PlaceData';
import { RowObj } from '../RowObj';

const dayjs = require('dayjs');
const sortBy = require('lodash/sortBy');

export function makeCruncherChunk(assets, start, max) {
  return new Mirror(
    {
      start,
      max,
      loadStatus: 'unloaded',
      rows: [],
      error: null,
      startDate: null,
      placeData: new Map(),
    },
    {
      mutable: true,
      assets,
      actions: {
        pdRows(mir) {
          const out = [];
          mir.value.placeData.forEach((pd) => {
            out.push(pd.statsToRows());
          });
          return out;
        },
        onLoad(mir, rows) {
          const rowObjs = sortBy(
            rows.map((row) => new RowObj(row)),
            'dayNum',
            'data.id',
          );
          mir.$do.setRows(rowObjs);

          const placeData = new Map();
          rowObjs.forEach((row) => {
            if (!placeData.has(row.data.uid)) {
              placeData.set(row.data.uid, new PlaceData(row.data.uid));
            }
            placeData.get(row.data.uid).digestRow(row);
          });
          mir.$do.setPlaceData(placeData);

          mir.$do.setLoadStatus('loaded');
        },
        onLoadError(mir, err) {
          console.warn('error loading chunk', err);
          mir.$do.setError(err.message ? err.message : err);
        },
        loadRows(mir) {
          if (mir.value.loadStatus !== 'unloaded') {
            console.warn('attempt to load rows with bad status');
            return;
          }
          mir.$do.setLoadStatus('loading');
          try {
            return mir.$assets.prismaService.covid_daily_cases_usa
              .find({
                where: {
                  AND: [
                    {
                      id: {
                        gte: mir.value.start,
                      },
                    },
                    {
                      id: {
                        lte: mir.value.max,
                      },
                    },
                  ],
                },
              })
              .then(mir.$do.onLoad)
              .catch(mir.$do.onLoadError);
          } catch (err) {
            console.log('---- error ----- ', err);
          }
        },
      },
    },
  );
}
