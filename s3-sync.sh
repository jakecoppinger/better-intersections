#!/usr/bin/env bash

aws s3 sync build/ s3://betterintersections.jakecoppinger.com/ --delete
aws s3 cp s3://betterintersections.jakecoppinger.com/index.html s3://betterintersections.jakecoppinger.com/index.html --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html --acl public-read

