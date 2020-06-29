# Gridlastic Connect Tunnel Client (gridc)
Securely connect your private [Gridlastic][gridlastic] selenium grid to your test environment. Access your selenium grid hub via localhost.


## Features

  * **Small**: Built using [Alpine][alpine], about 30mb in size..
  * **Simple**: Use environment variables to start encrypted tunnels to your local/remote/docker test environment in seconds.
  * **Secure**: Tunnel endpoints accessible only by your private Gridlastic selenium grid nodes. Runs as non-root user with a random UID `6838` (to avoid mapping to an existing UID).

## Quick demo start on Docker Desktop for Windows and MAC

    $ docker run --rm -it -p 3000:3000 -e GRIDC_ENDPOINT_SUBDOMAIN= -e GRIDC_USERNAME= -e GRIDC_ACCESS_KEY= -e GRIDC_HUB=3000 -e GRIDC_START_TUNNELS=all gridlastic/docker-gridc

Add your Gridlastic credentials and run (available after grid launch). Will produce 4 demo tunnels and access to your selenium grid hub via http://localhost:3000. If you have a site active on localhost:8001 (host.docker.internal:8001) you can run tests to it or start a service on 8001 like

    $ docker run --publish 8001:8080 --detach --name bb-gridc-test bulletinboard:1.0

See the output and note the endpoints, use them in your selenium test code like:

    $ driver().get("https://310f83db4663.hostmachine.8001.<GRIDC_ENDPOINT_SUBDOMAIN>.gridlastic.com:8091");
    
The "310f83db4663" reference is the container ID (default) unless setting the environmental value "-e GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX=something"


#### Example link to another docker container

If you have an web service running in a container named `bb-gridc-test` (reference to the bulletinboard container above) listening on internal container port 8080:

    $ docker run --rm -it --link bb-gridc-test -e GRIDC_ENDPOINT_SUBDOMAIN= -e GRIDC_USERNAME= -e GRIDC_ACCESS_KEY= -e GRIDC_PROTO=https -e GRIDC_SUBDOMAIN=bb-gridc-test -e GRIDC_ADDR_DOMAIN=bb-gridc-test -e GRIDC_ADDR_PORT=8080 gridlastic/docker-gridc

In your selenium code you access the tunnel like:

    $ driver().get("https://bb-gridc-test.<GRIDC_ENDPOINT_SUBDOMAIN>.gridlastic.com:8091/");
    
    
### Environment variables

Configure your tunnel via environment variables (via `-e`):

  * `GRIDC_ENDPOINT_SUBDOMAIN` - Gridlastic Connect subdomain (different from your selenium grid hub subdomain), see your Gridlastic dashboard after you launched your grid. 
  * `GRIDC_USERNAME` - Gridlastic username, see your Gridlastic dashboard after you launched your grid. 
  * `GRIDC_ACCESS_KEY` - Gridlastic access key, see your Gridlastic dashboard after you launched your grid. 
  * `GRIDC_PROTOCOL` - Can be `https`, `http`  or `tcp`. If set to `tcp`, Gridlastic Connect will allocate a port instead of a subdomain and proxy TCP requests directly to your application. Endpoint access for `https` is on port `8091` and for `http` port `8090`
  * `GRIDC_SUBDOMAIN` - Is used to create the endpoint for your selenium grid nodes. Must be unique (real time) per selenium grid and DNS compliant to avoid tunnel name conflicts. Subdomains are associated with protocol `http` and `https`. If not specified a random value is assigned by the server. In your selenium code you would access the tunnel like:
  
        $ driver().get("https://<GRIDC_SUBDOMAIN>.<GRIDC_ENDPOINT_SUBDOMAIN>.gridlastic.com:8091/");
   
   * `GRIDC_ADDR_DOMAIN` - Domain name/IP/docker container name of service to tunnel to, leave empty if service is on `localhost`.
   * `GRIDC_ADDR_PORT` - Port of service to tunnel to, like `80`
   * `GRIDC_HUB` - Port to tunnel to your Gridlastic selenium grid hub, like `3000`. Optional.
   * `GRIDC_START_TUNNELS` - If set to `all` starts all defined tunnels in the configuration file. Specify individual tunnels for selective starts like `-e "GRIDC_START_TUNNELS=tunnel-1 tunnel-2"`. Note: special behavior with `GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX`
   * `GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX` - Use this variable to create unique subdomain endpoints. If empty defaults to `$HOSTNAME` (container ID) when used with `GRIDC_START_TUNNELS`.


#### Example with custom gridc configuration file

Replace the `configuration-template.cfg` file with your own. All environmental variables are substituted automatically upon container start using `envsubst`

    $ docker run --rm -it -v /local/path/to/custom-local-config-template.cfg:/home/gridc/config-template.cfg -e GRIDC_ENDPOINT_SUBDOMAIN= -e GRIDC_USERNAME= -e GRIDC_ACCESS_KEY= -e GRIDC_START_TUNNELS=all gridlastic/docker-gridc



Example `custom-local-config-template.cfg`:

```
server_addr: ${GRIDC_ENDPOINT_SUBDOMAIN}.gridlastic.com:443
tunnels:
  hostmachine_http_9000:
    subdomain: ${GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX}.hostmachine.9000
    proto:
      http: host.docker.internal:9000
  hostmachine_https_9001:
    subdomain: ${GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX}.hostmachine.9001
    proto:
      https: host.docker.internal:9001
  container_http_9000:
    subdomain: ${GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX}.container.9000
    proto:
      http: 9000
  container_https_9001:
    subdomain: ${GRIDC_CONFIG_SUBDOMAIN_UUID_PREFIX}.container.9001
    proto:
      https: 9001
```


#### Example with running gridc container - create additional tunnels

    $ docker exec -it <gridc_container_name> gridc -proto https -subdomain=test host.docker.internal:8080
    
Read more about commands available for [Gridlastic Connect][gridlastic-connect].


## Feedback

Report issues/questions/feature requests on [GitHub Issues][issues].


[issues]:           	https://github.com/gridlastic/docker-gridc/issues
[gridlastic]:       	https://www.gridlastic.com/
[gridlastic-connect]:	https://www.gridlastic.com/gridlastic-connect.html
[alpine]:				https://registry.hub.docker.com/_/alpine