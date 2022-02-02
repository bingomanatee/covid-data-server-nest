-- CreateTable
CREATE TABLE "covid_cases" (
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "covid_daily_cases" (
    "id" INTEGER NOT NULL,
    "date_published" TIMESTAMP(3) NOT NULL,
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
    "confirmed" INTEGER,
    "deaths" INTEGER,
    "recovered" INTEGER,
    "active" INTEGER,
    "population" INTEGER,

    CONSTRAINT "covid_daily_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "covid_data" (
    "date_published" TIMESTAMP(3) NOT NULL,
    "uid" INTEGER NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "code3" TEXT NOT NULL,
    "fips" TEXT NOT NULL,
    "province_state" TEXT NOT NULL,
    "country_region" TEXT NOT NULL,
    "last_update" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION DEFAULT 0,
    "longitude" DOUBLE PRECISION DEFAULT 0,
    "confirmed" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "recovered" INTEGER NOT NULL,
    "active" INTEGER NOT NULL,
    "incident_rate" DOUBLE PRECISION,
    "people_tested" INTEGER NOT NULL,
    "people_hospitalized" INTEGER NOT NULL,
    "mortality_rate" INTEGER NOT NULL,
    "testing_rate" DOUBLE PRECISION,
    "hospitalization_rate" DOUBLE PRECISION,
    "population" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "locations" (
    "uid" INTEGER NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "code3" TEXT NOT NULL,
    "province_state" TEXT NOT NULL,
    "country_region" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "combined_key" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "admin2" TEXT NOT NULL,
    "fips" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "source_files" (
    "path" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_size" INTEGER NOT NULL,

    CONSTRAINT "source_files_pkey" PRIMARY KEY ("path")
);

-- CreateIndex
CREATE UNIQUE INDEX "covid_cases_label_day_key" ON "covid_cases"("label", "day");

-- CreateIndex
CREATE INDEX "covid_data_date_published_idx" ON "covid_data"("date_published");

-- CreateIndex
CREATE UNIQUE INDEX "covid_data_uid_date_published_key" ON "covid_data"("uid", "date_published");

-- CreateIndex
CREATE UNIQUE INDEX "locations_uid_key" ON "locations"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "source_files_path_key" ON "source_files"("path");
