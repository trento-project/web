# SPDX-License-Identifier: Apache-2.0
#!BuildTag: trento/trento-web:latest
#!BuildTag: trento/trento-web:%%VERSION%%
#!BuildTag: trento/trento-web:%%VERSION%%-build%RELEASE%
#!UseOBSRepositories
#!ExclusiveArch: x86_64
FROM bci/nodejs:20 AS assets-build

ADD web.tar.gz /usr/src/trento

WORKDIR /usr/src/trento/web/assets

RUN npm run tailwind:build \
    && npm run build


FROM bci/bci-base:15.4 AS release

# When set to C, it takes precedence over LANG and LANGUAGE
ENV LC_ALL C.UTF-8

# Used for Elixir's mix
ENV MIX_ENV=prod
ENV MIX_HOME=/usr/bin
ENV MIX_REBAR3=/usr/bin/rebar3
ENV MIX_PATH=/usr/lib/elixir/lib/hex/ebin

# Used by trento
ENV VERSION=%%VERSION%%

# Workaround for https://github.com/openSUSE/obs-build/issues/487
RUN zypper --non-interactive in sles-release
RUN zypper --non-interactive in make \
                                gcc \
                                git-core \
                                elixir>=1.15 \
                                elixir-hex \
                                erlang-rebar3

COPY --from=assets-build /usr/src/trento/web /usr/src/trento/web

WORKDIR /usr/src/trento/web

RUN mix phx.digest \
    && mix release


FROM bci/bci-base:15.4 AS trento
# Define labels according to https://en.opensuse.org/Building_derived_containers
# labelprefix=com.suse.trento
LABEL org.opencontainers.image.source="https://github.com/trento-project/web"

ENV LC_ALL C.UTF-8

# tar is required by kubectl cp
RUN zypper -n in tar \
    && zypper -n clean

RUN --mount=src=/usr/src/trento/web/_build/prod/rel,dst=/mnt,from=release \
    install --mode=0755 --preserve-timestamps /mnt/trento /usr/bin

EXPOSE 4000/tcp

ENTRYPOINT ["/usr/bin/trento"]
