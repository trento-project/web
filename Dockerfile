FROM registry.opensuse.org/opensuse/leap:15.4 AS system
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV MIX_ENV=prod
RUN zypper -n addrepo https://download.opensuse.org/repositories/devel:/languages:/erlang/15.4/devel:languages:erlang.repo &&\
    zypper -n --gpg-auto-import-keys ref -s &&\
    zypper -n in elixir nodejs16 npm16
WORKDIR /app
RUN mix local.rebar --force &&\
    mix local.hex --force

FROM system AS deps
COPY ./mix.* /app/
COPY assets/package*.json /app/assets/
RUN mix deps.all

FROM deps AS full
COPY . /app
RUN mix assets.deploy &&\
    mix release

FROM registry.suse.com/bci/bci-base:15.4 AS minimal
LABEL org.opencontainers.image.source="https://github.com/trento-project/web"
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
# tar is required by kubectl cp
RUN zypper -n in tar
WORKDIR /app
COPY --from=full /app/_build/prod/rel/trento .
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/trento"]
