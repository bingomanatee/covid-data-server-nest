import DateRep from './DateRep';
import { Prisma } from '@prisma/client';

function asInt(value) {
  const i = parseInt(value);
  if (isNaN(i)) {
    return 0;
  } else {
    return i;
  }
}

function asFloat(value) {
  try {
    const i = parseFloat(value);
    if (isNaN(i)) {
      return null;
    }
    return i;
  } catch (err) {
    return null;
  }
}

function asDate(date) {
  const value = new DateRep(date);
  return value.invalid ? null : value.asDate();
}

export const KEYS = [
  'date_published',
  'uid',
  'iso2',
  'iso3',
  'code3',

  'fips',
  'province_state',
  'country_region',

  'last_update',
  'latitude',
  'longitude',
  'confirmed',
  'deaths',
  'recovered',
  'active',
  'incident_rate',
  'people_tested',
  'people_hospitalized',
  'mortality_rate',
  'testing_rate',
  'hospitalization_rate',
  'population',
];
export default class CaseRow {
  constructor(data) {
    Object.keys(data).forEach((key) => {
      const lcKey = key.toLowerCase();
      if (KEYS.includes(lcKey)) {
        this[lcKey] = data[key];
      }
    });
  }

  valueOf() {
    return KEYS.reduce((out, name) => {
      out[name] = this[name];
      return out;
    }, {});
  }

  getInsertFields() {
    return KEYS;
  }

  getInsertVariables() {
    return KEYS.map((key) => {
      const value = this[key];
      if (value === null) {
        return 'null';
      }
      if (value instanceof Date) {
        return `'${new DateRep(value).toString()}'`;
      }
      switch (typeof value) {
        case 'string':
          return `'${value}'`;
          break;

        case 'number':
          return value;
          break;

        default:
          return value;
      }
    });
  }
}

function defProps(myClass, names, inputFilter, start) {
  names.forEach((name) => {
    const localName = '_' + name;
    const propDef = {
      configurable: false,
      enumerable: true,
      get() {
        if (!(localName in this)) {
          this[localName] = start;
        }
        return this[localName];
      },
      set(value) {
        this[localName] = inputFilter(value);
      },
    };

    Object.defineProperty(myClass.prototype, name, propDef);
    Object.defineProperty(myClass.prototype, localName, {
      enumerable: false,
      writable: true,
    });
  });
}

defProps(
  CaseRow,
  [
    'mortality_rate',
    'active',
    'population',
    'people_tested',
    'confirmed',
    'deaths',
    'uid',
    'recovered',
    'people_hospitalized',
  ],
  asInt,
  0,
);

defProps(CaseRow, ['date_published', 'last_update'], asDate, null);
defProps(
  CaseRow,
  [
    'longitude',
    'latitude',
    'incident_rate',
    'testing_rate',
    'hospitalization_rate',
  ],
  asFloat,
  null,
);
/*
toInt(row, 'Mortality_Rate', 'Incident_Rate', 'Active', 'Population', 'People_Tested', 'Confirmed', 'Deaths', 'UID', 'Recovered', 'People_Hospitalized');
    toDate(row, 'Date_Published', 'Last_Update');
    toFloat(row, 'Longitude', 'Latitude', 'Testing_Rate', 'Hospitalization_Rate');
 */
