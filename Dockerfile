FROM registry.opensuse.org/opensuse/leap:15.4 AS elixir-deps
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV MIX_ENV=prod
RUN zypper -n addrepo https://download.opensuse.org/repositories/devel:/languages:/erlang/15.4/devel:languages:erlang.repo &&\
    zypper -n --gpg-auto-import-keys ref -s &&\
    zypper -n in elixir
COPY ./mix.* /app/
WORKDIR /app
RUN mix local.rebar --force &&\
    mix local.hex --force &&\
    mix deps.get

FROM registry.suse.com/bci/nodejs:16 AS node-deps
COPY assets/package*.json /app/assets/
WORKDIR /app/assets
RUN npm install

FROM node-deps as node-build
COPY --from=elixir-deps /app /app
COPY --from=node-deps /app/assets /app/assets
COPY ./assets /app/assets
RUN npm run tailwind:build &&\
    npm run build

FROM elixir-deps AS elixir-build
COPY --from=elixir-deps /app /app
COPY --from=node-build /app/assets /app/assets
COPY . /app
RUN mix phx.digest &&\
    mix release

FROM registry.suse.com/bci/bci-base:15.4 AS trento
LABEL org.opencontainers.image.source="https://github.com/trento-project/web"
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
# tar is required by kubectl cp
RUN zypper -n in tar
WORKDIR /app
COPY --from=elixir-build /app/_build/prod/rel/trento .
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/trento"]
