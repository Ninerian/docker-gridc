const { remote } = require("webdriverio");
const fetch = require("node-fetch");

require("dotenv").config();
const {
  SELENIUM_HUB,
  GRIDC_USERNAME,
  GRIDC_ACCESS_KEY,
  GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX,
  GRIDC_ENDPOINT_SUBDOMAIN,
  GRIDC_PROTOCOL,
  GRIDC_PORT,
} = process.env;

const { hostname, protocol, port, pathname } = new URL(SELENIUM_HUB);
const FRONTEND_URL = `${GRIDC_PROTOCOL}://${GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX}-host.${GRIDC_ENDPOINT_SUBDOMAIN}.gridlastic.com:${GRIDC_PORT}`;

(async () => {
  const browser = await remote({
    logLevel: "trace",
    capabilities: {
      browserName: "chrome",
      browserVersion: "latest",
      platformName: "linux",
    },
    hostname,
    protocol: protocol.split(":")[0],
    port: port ? Number(port) : protocol === "https:" ? 443 : 80,
    path: pathname,
    user: GRIDC_USERNAME,
    key: GRIDC_ACCESS_KEY,
  });

  await browser.url(FRONTEND_URL);

  const h1 = await browser.$("h1");

  console.log(await h1.getText());

  const response = await fetch(FRONTEND_URL + "/user/create", {
    method: "POST",
    body: { foo: "bar" },
  });

  console.log(response);
  await browser.deleteSession();
})().catch((e) => console.error(e));
