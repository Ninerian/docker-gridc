# Example of failing POST request

This repo should help to identify a problem I have, running POST request to
a webserver through the Gridc tunnel.

## Steps to reproduce

1. Copy .env.example to .env and fill the missing values
1. Run `yarn install`
1. Run `docker-compose up -d gridc-tunnel-to-web-site-1`
1. Run `node test.js`

Test should fail with a timeout at the fetch call.
