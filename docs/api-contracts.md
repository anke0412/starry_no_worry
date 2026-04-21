# Starry No Worry API Contracts

This document records the Phase 1 chart API contract shared by the React frontend and FastAPI backend.

## Current Status

The chart endpoints are registered and validate request bodies, but calculation is not implemented yet. Valid requests return a structured `not_implemented` error until the calculation modules are added.

## Base URL

Local backend:

```text
http://localhost:8000
```

## Health

### GET /api/health

Returns service metadata.

```json
{
  "status": "ok",
  "service": "astrology-calculation-api",
  "version": "0.1.0",
  "environment": "development"
}
```

## Shared Request Shapes

### BirthProfile

```json
{
  "id": "optional-local-id",
  "name": "Luna",
  "date": "1996-04-12",
  "time": "08:30",
  "locationName": "Shanghai",
  "latitude": 31.2304,
  "longitude": 121.4737,
  "timezone": "Asia/Shanghai"
}
```

Required fields:

- `name`
- `date`
- `time`
- `locationName`

Optional fields:

- `id`
- `latitude`
- `longitude`
- `timezone`

### ChartSettings

```json
{
  "houseSystem": "placidus",
  "zodiac": "tropical",
  "aspectSet": "major",
  "orbProfile": "default"
}
```

Phase 1 only supports the default setting values. Later modules can expand the allowed values.

## Chart Endpoints

### POST /api/charts/natal

Request:

```json
{
  "primary": {
    "name": "Luna",
    "date": "1996-04-12",
    "time": "08:30",
    "locationName": "Shanghai",
    "timezone": "Asia/Shanghai"
  },
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

### POST /api/charts/synastry

Request:

```json
{
  "primary": {
    "name": "Luna",
    "date": "1996-04-12",
    "time": "08:30",
    "locationName": "Shanghai",
    "timezone": "Asia/Shanghai"
  },
  "secondary": {
    "name": "Sol",
    "date": "1993-09-07",
    "time": "21:10",
    "locationName": "Beijing",
    "timezone": "Asia/Shanghai"
  },
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

### POST /api/charts/transit

Request:

```json
{
  "primary": {
    "name": "Luna",
    "date": "1996-04-12",
    "time": "08:30",
    "locationName": "Shanghai",
    "timezone": "Asia/Shanghai"
  },
  "transitDate": "2026-05-01",
  "transitTime": "12:00",
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

## Temporary Not Implemented Response

Valid chart requests currently return:

```json
{
  "error": {
    "code": "not_implemented",
    "message": "Chart calculation endpoint is not implemented yet."
  }
}
```

## Frontend Helper

Frontend payload builders live in `src/lib/api/chartContracts.js`.

They map the current UI profile shape to the backend API contract:

- `location` or `locationName` becomes `locationName`
- empty optional fields are omitted
- default chart settings are attached automatically

## Backend Models

Backend Pydantic models live in `backend/app/models/chart.py`.

The models use Python snake_case internally and JSON aliases externally, for example:

- `chart_type` serializes as `chartType`
- `location_name` serializes as `locationName`
- `house_system` serializes as `houseSystem`
