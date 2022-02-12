/*
  Warnings:

  - A unique constraint covering the columns `[label,day]` on the table `covid_cases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid,date_published]` on the table `covid_data` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `locations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[path]` on the table `source_files` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "covid_cases_label_day_key";

-- DropIndex
DROP INDEX "covid_daily_cases_country_region_idx";

-- DropIndex
DROP INDEX "covid_daily_cases_date_published_idx";

-- DropIndex
DROP INDEX "covid_daily_cases_uid_idx";

-- DropIndex
DROP INDEX "covid_data_date_published_idx";

-- DropIndex
DROP INDEX "covid_data_uid_date_published_key";

-- DropIndex
DROP INDEX "locations_uid_key";

-- DropIndex
DROP INDEX "source_files_path_key";

-- CreateTable
CREATE TABLE "covid_daily_cases_usa" (
    "id" INTEGER NOT NULL,
    "date_published" TIMESTAMP(3) NOT NULL,
    "uid" INTEGER NOT NULL,
    "code3" TEXT NOT NULL,
    "fips" TEXT NOT NULL,
    "admin2" TEXT NOT NULL,
    "province_state" TEXT NOT NULL,
    "confirmed" INTEGER,
    "deaths" INTEGER,
    "recovered" INTEGER,
    "active" INTEGER,
    "population" INTEGER,

    CONSTRAINT "covid_daily_cases_usa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations_usa" (
    "uid" INTEGER NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "code3" TEXT NOT NULL,
    "fips" TEXT NOT NULL,
    "admin2" TEXT NOT NULL,
    "province_state" TEXT NOT NULL,
    "country_region" TEXT NOT NULL,
    "last_update" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "locations_usa_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE INDEX "covid_daily_cases_usa_date_published_idx" ON "covid_daily_cases_usa"("date_published");

-- CreateIndex
CREATE INDEX "covid_daily_cases_usa_uid_idx" ON "covid_daily_cases_usa"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "locations_usa_uid_key" ON "locations_usa"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "covid_cases_label_day_key" ON "covid_cases"("label", "day");

-- CreateIndex
CREATE INDEX "covid_daily_cases_country_region_idx" ON "covid_daily_cases"("country_region");

-- CreateIndex
CREATE INDEX "covid_daily_cases_date_published_idx" ON "covid_daily_cases"("date_published");

-- CreateIndex
CREATE INDEX "covid_daily_cases_uid_idx" ON "covid_daily_cases"("uid");

-- CreateIndex
CREATE INDEX "covid_data_date_published_idx" ON "covid_data"("date_published");

-- CreateIndex
CREATE UNIQUE INDEX "covid_data_uid_date_published_key" ON "covid_data"("uid", "date_published");

-- CreateIndex
CREATE UNIQUE INDEX "locations_uid_key" ON "locations"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "source_files_path_key" ON "source_files"("path");
