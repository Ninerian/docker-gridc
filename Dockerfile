FROM alpine:3.12

RUN set -x && \
    apk add --no-cache -t .deps ca-certificates && \
    # Install glibc on Alpine (required by docker-compose) from
    # https://github.com/sgerrand/alpine-pkg-glibc
    # See also https://github.com/gliderlabs/docker-alpine/issues/11
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.29-r0/glibc-2.29-r0.apk && \
    apk add glibc-2.29-r0.apk && \
    rm glibc-2.29-r0.apk && \
    apk del --purge .deps
    
RUN apk add --no-cache curl openssl gettext && \
    addgroup -g 6838 -S gridc && \
    adduser -u 6838 -S gridc -G gridc -h /home/gridc

ADD https://www.gridlastic.com/downloads/c2/gridc-1.2-linux_64.tar.gz /home/gridc/gridc.tar.gz

COPY entrypoint.sh /
#Remove any windows special EOL
RUN set -x \
 && sed -i -e 's/\r//g' /entrypoint.sh
 
 
RUN cd /home/gridc \
 && tar xfvz gridc.tar.gz gridc \
 && rm gridc.tar.gz \
 && chown gridc:gridc gridc \
 && mv gridc /bin \
 && mkdir -p .gridc \
 && chmod 777 -R /home/gridc

COPY config-template.cfg /home/gridc/
# Remove any windows special EOL
RUN set -x \
 && sed -i -e 's/\r//g' /home/gridc/config-template.cfg


USER gridc
ENV USER=gridc

ENTRYPOINT ["/entrypoint.sh"]