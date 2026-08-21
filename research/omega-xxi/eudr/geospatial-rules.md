# EUDR geospatial rules — evidence ledger

## Supported now

- The Commission provides geolocation-file compatibility testing and qualified feedback.
- EUDR due diligence requires geolocation evidence for production plots.

## Not yet encoded as facts

The exact accepted geometry types, coordinate reference system, precision, ring orientation, vertex limits, file-size limits, multipolygon behavior, antimeridian behavior, and bulk constraints must be extracted from the **current** Information System documentation and verified in ACCEPTANCE. Prior versions and vendor blog summaries are not sufficient.

## Fixture plan

| Fixture | Expected purpose |
|---|---|
| valid point | baseline small plot |
| valid polygon | baseline larger plot |
| unclosed ring | structural rejection |
| self-intersection | topology rejection/normalisation |
| reversed ring | orientation behavior |
| duplicate vertices | tolerance behavior |
| out-of-range coordinates | coordinate validation |
| wrong CRS | CRS behavior |
| huge polygon | vertex/payload limit |
| multipolygon | supported-type behavior |
| boundary/antimeridian | geographic edge behavior |

Source: https://environment.ec.europa.eu/news/eu-deforestation-regulation-information-system-launches-2024-12-06_en

