# SPDX-License-Identifier: Apache-2.0
#!BuildTag: trento/trento-web:latest
#!BuildTag: trento/trento-web:%%VERSION%%
#!BuildTag: trento/trento-web:%%VERSION%%-build%RELEASE%
#!BuildName: trento-web
#!BuildVersion: %%VERSION%%
#!UseOBSRepositories
#!ExclusiveArch: x86_64

ARG OS_VER=15.7
FROM registry.suse.com/bci/nodejs:22 AS assets-build
ADD web.tar.gz /build/
WORKDIR /build/web/assets
RUN npm run tailwind:build
RUN npm run build

FROM registry.suse.com/bci/bci-base:${OS_VER} AS release
RUN zypper -n in make gcc git-core elixir==1.15 elixir-hex erlang==26 erlang-rebar3
COPY --from=assets-build /build /build
WORKDIR /build/web/
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
ENV MIX_ENV=prod
ENV MIX_HOME=/usr/bin
ENV MIX_REBAR3=/usr/bin/rebar3
ENV MIX_PATH=/usr/lib/elixir/lib/hex/ebin
ENV VERSION=%%VERSION%%
ENV GTM_ID=%%GTM_ID%%
RUN mix phx.digest
RUN mix release

FROM registry.suse.com/bci/bci-base:${OS_VER}
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
# Define labels according to https://en.opensuse.org/Building_derived_containers
# labelprefix=com.suse.trento
LABEL org.opencontainers.image.authors="https://github.com/trento-project/web/graphs/contributors"
LABEL org.opencontainers.image.title="Trento Web"
LABEL org.opencontainers.image.description="The companion web app for SUSE Linux Enterprise Server for SAP Applications"
LABEL org.opencontainers.image.documentation="https://documentation.suse.com/sles-sap/trento"
LABEL org.opencontainers.image.version="%%VERSION%%"
LABEL org.opencontainers.image.url="https://www.suse.com/products/base-container-images/"
LABEL org.opencontainers.image.created="%BUILDTIME%"
LABEL org.opencontainers.image.vendor="SUSE LLC"
LABEL org.opencontainers.image.source="%SOURCEURL%"
LABEL org.opencontainers.image.ref.name="%%VERSION%%-build%RELEASE%"
LABEL org.opensuse.reference="registry.suse.com/trento/trento-web:%%VERSION%%-build%RELEASE%"
LABEL org.openbuildservice.disturl="%DISTURL%"
LABEL com.suse.supportlevel="l3"
LABEL com.suse.supportlevel.until=""
LABEL com.suse.eula="sle-eula"
LABEL com.suse.lifecycle-url="https://www.suse.com/lifecycle#suse-linux-enterprise-server-for-sap-applications-15"
LABEL com.suse.release-stage="released"
# endlabelprefix
LABEL org.opencontainers.image.base.name="%BASE_REFNAME%"
LABEL org.opencontainers.image.base.digest="%BASE_DIGEST%"
LABEL io.artifacthub.package.logo-url="https://www.trento-project.io/images/trento-icon.svg"
LABEL io.artifacthub.package.readme-url="%SOURCEURL_WITH(README.md)%"
# Erlang runtime dependencies
RUN zypper -n in libsystemd0 libopenssl3
WORKDIR /app
COPY --from=release /build/web/_build/prod/rel/trento .
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/trento"]
