# EUDR API investigation

The Commission launched the EUDR Information System with LIVE and ACCEPTANCE servers. ACCEPTANCE is a replica/training environment with no legal value; the Commission also provides geolocation-file testing and qualified feedback. The runtime hypothesis is a canonical DDS object plus validation, conformance fixtures, retries, idempotency, status synchronisation and evidence replay.

## Must verify directly before production claims

- current API version and OpenAPI download
- authentication/service-account model
- batch and rate limits
- exact submission/status endpoints
- error codes and webhook/polling behaviour
- production onboarding and conformance gate

Official starting points: https://environment.ec.europa.eu/news/eu-deforestation-regulation-information-system-launches-2024-12-06_en and https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en.
