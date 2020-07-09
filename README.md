# Gridlastic Connect Tunnel Client (gridc)
Securely connect your private [Gridlastic][gridlastic] selenium grid to your test environment. Access your selenium grid hub via localhost.


## Features

  * **Small**: Built using [Alpine][alpine], about 22mb in size.
  * **Simple**: Use environment variables to start encrypted tunnels to your local/remote/docker test environment in seconds.
  * **Secure**: Tunnel endpoints accessible only by your private Gridlastic selenium grid nodes. Runs as non-root user with a random UID `6838` (to avoid mapping to an existing UID).

## Quick demo start for Docker Desktop MAC/Windows

    $ docker run --rm -it -p 3000:3000 --name running-gridc -e GRIDC_ENDPOINT_SUBDOMAIN= -e GRIDC_USERNAME= -e GRIDC_ACCESS_KEY= -e GRIDC_HUB=3000 -e GRIDC_PROTOCOL=https -e GRIDC_SUBDOMAIN=hostmachine-hello-world -e GRIDC_ADDR_DOMAIN=host.docker.internal -e GRIDC_ADDR_PORT=8001 gridlastic/docker-gridc

Add your Gridlastic credentials `GRIDC_ENDPOINT_SUBDOMAIN`, `GRIDC_USERNAME` and `GRIDC_ACCESS_KEY` (available after you launch your Gridlastic selenium grid) and run. On the host machine, creates a Hub API access endpoint to use in your selenium code like (if test runner on hostmachine) `http://<USERNAME:ACCESS_KEY>@localhost:3000/wd/hub`. You can also access the grid console like `http://localhost:3000/grid/console`. Username/access_key needs to be provided for these endpoints. Also starts a tunnel to a site (existing or not) on `localhost:8001`. If you have a site active on `localhost:8001` you can run tests to it or start a site on port `8001` like

    $ docker run --publish 8001:80 --detach --name test-gridc-site gridlastic/docker-hello-world

To tunnel to the test site use this in your selenium test code:

    $ driver().get("https://hostmachine-hello-world.<GRIDC_ENDPOINT_SUBDOMAIN>.gridlastic.com:8091");
    

#### Now start an additional gridc/tunnel container linking to the docker-hello-world container above, accessing the site on internal container port 80

If you have an web service running in a container named `test-gridc-site` listening on internal container port 80:

    $ docker run --rm -it --link test-gridc-site --name running-gridc-linked-to-test-site -e GRIDC_ENDPOINT_SUBDOMAIN= -e GRIDC_USERNAME= -e GRIDC_ACCESS_KEY= -e GRIDC_PROTOCOL=https -e GRIDC_SUBDOMAIN=container-hello-world -e GRIDC_ADDR_DOMAIN=test-gridc-site -e GRIDC_ADDR_PORT=80 gridlastic/docker-gridc

In your selenium code you access the tunnel like:

    $ driver().get("https://container-hello-world.<GRIDC_ENDPOINT_SUBDOMAIN>.gridlastic.com:8091/");
    
#### Create additional tunnels using gridc commands on an already running gridc containers (started above) 

    $ docker exec -it running-gridc gridc -proto https -subdomain=another-tunnel-to-hostmachine-port-8001 host.docker.internal:8001
    $ docker exec -it running-gridc-linked-to-test-site -proto https -subdomain=another-tunnel-to-container-port-80 test-gridc-site:80
    
You can also start an empty gridc (no tunnels defined in config file) like:

     $ docker run --rm -it --name gridc-no-initial-tunnels -e GRIDC_ENDPOINT_SUBDOMAIN= -e GRIDC_USERNAME= -e GRIDC_ACCESS_KEY= -e GRIDC_START_CONFIG_TUNNELS=all gridlastic/docker-gridc
    
and then in a test runner start tunnels on the fly using unique subdomains that are also used in the tests. Read more about commands available for [Gridlastic Connect][gridlastic-connect].

### Example using custom gridc configuration file

Replace the `config-template.cfg` file with your own. All environmental variables are substituted automatically upon container start using `envsubst`

    $ docker run --rm -it -v /local/path/to/custom-config-template.cfg:/home/gridc/config-template.cfg -e GRIDC_ENDPOINT_SUBDOMAIN= -e GRIDC_USERNAME= -e GRIDC_ACCESS_KEY= -e GRIDC_START_CONFIG_TUNNELS=all gridlastic/docker-gridc



Example `custom-config-template.cfg`

```
server_addr: ${GRIDC_ENDPOINT_SUBDOMAIN}.gridlastic.com:443
http_proxy:
username:
password:
tunnels:
  hostmachine_http_9000:
    subdomain: ${GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX}-hostmachine-9000
    proto:
      http: host.docker.internal:9000
  hostmachine_https_9001:
    subdomain: ${GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX}-hostmachine-9001
    proto:
      https: host.docker.internal:9001
  hostmachine_443:
    remote_port:
    proto:
      tcp: host.docker.internal:443
```

Note that the line `server_addr: ${GRIDC_ENDPOINT_SUBDOMAIN}.gridlastic.com:443` must always be present in any custom config file and is the only line in the default `config-template.cfg`. The variable `GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX` has special behavior when used with `GRIDC_START_CONFIG_TUNNELS`, see environmental variables below. Also, you can provide the credentials in the config file although we recommend you use environment variables. http_proxy can be used to reach Gridlastic via a corporate proxy.


### Example - start the selenium grid hub endpoint in its own container


    $ docker run --rm -it -p 4444:4444 -e GRIDC_ENDPOINT_SUBDOMAIN= -e GRIDC_USERNAME= -e GRIDC_ACCESS_KEY= -e GRIDC_HUB=4444 gridlastic/docker-gridc

Hub API access endpoint in your selenium code becomes `http://<USERNAME:ACCESS_KEY>@localhost:4444/wd/hub` or access the grid console like `http://localhost:4444/grid/console`. Username/access_key needs to be provided for these endpoints.


### Example - start TCP tunnel to https site


    $ docker run --rm -it -e GRIDC_ENDPOINT_SUBDOMAIN= -e GRIDC_USERNAME= -e GRIDC_ACCESS_KEY= -e GRIDC_PROTOCOL=tcp -e GRIDC_ADDR_DOMAIN=github.com -e GRIDC_ADDR_PORT=443 gridlastic/docker-gridc

TCP endpoints do not have subdomains but are issued a random port between `9000-9999` by the server. To tunnel to the test site use this in your selenium test code:

    $ driver().get("https://<GRIDC_ENDPOINT_SUBDOMAIN>.gridlastic.com:9001");

where the port 9001 is randomly assigned or can be requested in the config file like:

```
tunnels:
  my_https_site:
    remote_port: 9001
    proto:
      tcp: github.com:443
```
Also, when mapping to a https site serving valid or self signed ssl, the domain names do not match so the browser displays a certificate error message which can be resolved by adding flags to your selenium code like for Chrome:

    $ options.addArguments("ignore-certificate-errors");

Keep in mind that unlike subdomains which have unlimited unique endpoint capability, tcp ports are limited and must also be coordinated to avoid tunnel conflicts if they are specifically requested in the config file. Leave `remote_port:` empty in the config file for randomly assigned. Read more about [Gridlastic Connect tcp tunneling][gridlastic-connect-tcp].   


### Environment variables

Configure your tunnel via environment variables (via `-e`):

  * `GRIDC_ENDPOINT_SUBDOMAIN` - Gridlastic Connect subdomain (different from your selenium grid hub subdomain), see your Gridlastic dashboard after you launched your grid. 
  * `GRIDC_USERNAME` - Gridlastic username, see your Gridlastic dashboard after you launched your grid. 
  * `GRIDC_ACCESS_KEY` - Gridlastic access key, see your Gridlastic dashboard after you launched your grid. 
  * `GRIDC_PROTOCOL` - Can be `https`, `http`  or `tcp`. If set to `tcp`, Gridlastic Connect will allocate a port instead of a subdomain and proxy TCP requests directly to your application. Endpoint access for `https` is on port `8091` and for `http` port `8090`
  * `GRIDC_SUBDOMAIN` - Is used to create the endpoint for your selenium grid nodes. Must be unique (real time) per selenium grid and a valid single DNS string (no dots and max 63 characters) to avoid tunnel name conflicts. Subdomains are associated with protocol `http` and `https`. If not specified a random value is assigned by the server. In your selenium code you would access the tunnel like:
  
        $ driver().get("https://<GRIDC_SUBDOMAIN>.<GRIDC_ENDPOINT_SUBDOMAIN>.gridlastic.com:8091/");
   
  * `GRIDC_ADDR_DOMAIN` - Domain name/IP/docker container name of service to tunnel to, leave empty if service is on `localhost`.
  * `GRIDC_ADDR_PORT` - Port of service to tunnel to, like `80`
  * `GRIDC_HUB` - Port to tunnel to your Gridlastic selenium grid hub, like `3000`. Optional.
  * `GRIDC_START_CONFIG_TUNNELS` - If set to `all` starts all defined tunnels in the configuration file. Specify individual tunnels for selective starts like `-e "GRIDC_START_CONFIG_TUNNELS=tunnel-1 tunnel-2"`. Note: special behavior with `GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX`
  * `GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX` - Use this variable to create unique subdomain endpoints. If empty defaults to `$HOSTNAME` (container ID) when used with `GRIDC_START_CONFIG_TUNNELS`. Tip: start the container(s) from your test runner with your own unique subdomain prefix that you can use in your selenium tests.


## Feedback

Report issues/questions/feature requests on [GitHub Issues][issues].


[issues]:           	https://github.com/gridlastic/docker-gridc/issues
[gridlastic]:       	https://www.gridlastic.com/
[gridlastic-connect]:	https://www.gridlastic.com/gridlastic-connect.html
[gridlastic-connect-tcp]:	https://www.gridlastic.com/gridlastic-connect.html#tcp
[alpine]:				https://registry.hub.docker.com/_/alpine