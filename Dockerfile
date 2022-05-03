FROM registry.opensuse.org/opensuse/leap:15.4 AS system
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN zypper -n addrepo https://download.opensuse.org/repositories/devel:/languages:/erlang/15.4/devel:languages:erlang.repo &&\
    zypper -n --gpg-auto-import-keys ref -s &&\
    zypper -n in inotify-tools elixir nodejs16 npm16
WORKDIR /source
RUN mix local.rebar --force &&\
    mix local.hex --force

FROM system AS deps
ENV MIX_ENV=prod
COPY ./mix.* /source/
COPY assets/package*.json /source/assets/
RUN mix install

FROM deps AS full
LABEL org.opencontainers.image.version="rolling-full"
LABEL org.opencontainers.image.source="https://github.com/trento-project/web"
COPY . /source
RUN mix assets.deploy &&\
    mix release --path /app
WORKDIR /app
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/trento"]

FROM registry.suse.com/bci/bci-base:15.4 AS minimal
LABEL org.opencontainers.image.version="rolling"
LABEL org.opencontainers.image.source="https://github.com/trento-project/web"
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
# tar is required by kubectl cp
RUN zypper -n in tar
WORKDIR /app
COPY --from=full /app .
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/trento"]
