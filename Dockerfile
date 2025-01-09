FROM opensuse/leap:15.6 AS elixir-build
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
RUN zypper ar https://download.opensuse.org/repositories/devel:sap:trento:builddeps/15.6 buildeps
RUN zypper -n --gpg-auto-import-keys ref
RUN zypper -n in make gcc git-core elixir==1.15 elixir-hex erlang==26 erlang-rebar3
COPY . /build
WORKDIR /build
ARG MIX_ENV=prod
ENV MIX_ENV=$MIX_ENV
RUN mix deps.get

FROM registry.suse.com/bci/nodejs:20 AS assets-build
COPY --from=elixir-build /build /build
WORKDIR /build/assets
RUN npm install
RUN npm run tailwind:build
RUN npm run build

FROM elixir-build AS release
COPY --from=assets-build /build /build
WORKDIR /build
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
ARG MIX_ENV=prod
ENV MIX_ENV=$MIX_ENV
ENV MIX_HOME=/usr/bin
ENV MIX_REBAR3=/usr/bin/rebar3
ENV MIX_PATH=/usr/lib/elixir/lib/hex/ebin
RUN mix phx.digest
RUN mix release

FROM opensuse/leap:15.6
LABEL org.opencontainers.image.source="https://github.com/trento-project/web"
ARG MIX_ENV=prod
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
# tar is required by kubectl cp
RUN zypper -n in tar
WORKDIR /app
COPY --from=release /build/_build/$MIX_ENV/rel/trento .
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/trento"]
