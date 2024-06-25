# SPDX-License-Identifier: Apache-2.0
#!BuildTag: trento/trento-web:latest
#!BuildTag: trento/trento-web:%%VERSION%%
#!BuildTag: trento/trento-web:%%VERSION%%-build%RELEASE%
#!UseOBSRepositories
#!ExclusiveArch: x86_64

FROM bci/nodejs:16 AS assets-build
ADD web.tar.gz /build/
WORKDIR /build/web/assets
RUN npm run tailwind:build
RUN npm run build

FROM bci/bci-base:15.4 AS release
# Workaround for https://github.com/openSUSE/obs-build/issues/487
RUN zypper --non-interactive in sles-release
RUN zypper -n in make gcc git-core elixir>=1.15 elixir-hex erlang-rebar3
COPY --from=assets-build /build /build
WORKDIR /build/web/
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV MIX_ENV=prod
ENV MIX_HOME=/usr/bin
ENV MIX_REBAR3=/usr/bin/rebar3
ENV MIX_PATH=/usr/lib/elixir/lib/hex/ebin
ENV FLAVOR="Premium"
ENV VERSION=%%VERSION%%
RUN mix phx.digest
RUN mix release

FROM bci/bci-base:15.4 AS trento
# Define labels according to https://en.opensuse.org/Building_derived_containers
# labelprefix=com.suse.trento
LABEL org.opencontainers.image.source="https://github.com/trento-project/web"
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
# tar is required by kubectl cp
RUN zypper -n in tar
WORKDIR /app
COPY --from=release /build/web/_build/prod/rel/trento .
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/trento"]
