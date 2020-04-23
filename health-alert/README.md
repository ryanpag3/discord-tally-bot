# Health Alert Service
This service is responsible for alerting when the deployed container becomes unhealthy.

## Definition of healthy
The tally bot container checks itself every 5 seconds and queries its connection status with discord. If it fails for 30s consecutively, it will trigger an "unhealthy" state.

## Usage
TBD

## Configuration
TBD