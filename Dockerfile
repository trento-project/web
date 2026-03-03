ARG OS_VER=15.7
FROM registry.suse.com/bci/bci-base:${OS_VER} AS elixir-build
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
RUN zypper ar https://download.opensuse.org/repositories/devel:sap:trento:builddeps/${OS_VER} builddeps
RUN zypper -n --gpg-auto-import-keys ref
RUN zypper -n in make gcc git-core elixir==1.15 elixir-hex erlang==26 erlang-rebar3
COPY . /build
WORKDIR /build
ARG MIX_ENV=prod
ENV MIX_ENV=$MIX_ENV
RUN mix deps.get

FROM registry.suse.com/bci/nodejs:22 AS assets-build
COPY --from=elixir-build /build /build
WORKDIR /build/assets
RUN npm install
RUN npm run tailwind:build
RUN npm run build

FROM elixir-build AS release
COPY --from=assets-build /build /build
WORKDIR /build
ARG MIX_ENV=prod
ARG VERSION
ARG GTM_ID
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
ENV VERSION=$VERSION
ENV GTM_ID=$GTM_ID
ENV MIX_ENV=$MIX_ENV
ENV MIX_HOME=/usr/bin
ENV MIX_REBAR3=/usr/bin/rebar3
ENV MIX_PATH=/usr/lib/elixir/lib/hex/ebin
RUN mix phx.digest
RUN mix release

FROM registry.suse.com/bci/bci-base:${OS_VER}
ARG DATE
ARG OS_VER
ARG VERSION
ARG MIX_ENV=prod
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
# Define labels according to https://en.opensuse.org/Building_derived_containers
# labelprefix=com.suse.trento
LABEL org.opencontainers.image.authors="https://github.com/trento-project/web/graphs/contributors"
LABEL org.opencontainers.image.title="Trento Web"
LABEL org.opencontainers.image.description="The companion web app for SUSE Linux Enterprise Server for SAP Applications"
LABEL org.opencontainers.image.documentation="https://www.trento-project.io/docs/web/README.html"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.url="https://www.suse.com/products/base-container-images/"
LABEL org.opencontainers.image.created="${DATE}"
LABEL org.opencontainers.image.vendor="SUSE LLC"
LABEL org.opencontainers.image.source="https://github.com/trento-project/web"
LABEL org.opencontainers.image.ref.name="${OS_VER}-${VERSION}"
LABEL org.opensuse.reference="registry.suse.com/bci/bci-micro:${OS_VER}"
LABEL org.openbuildservice.disturl="https://github.com/trento-project/web/pkgs/container/trento-web"
LABEL com.suse.supportlevel="l3"
LABEL com.suse.supportlevel.until=""
LABEL com.suse.eula="sle-bci"
LABEL com.suse.lifecycle-url="https://www.suse.com/lifecycle#suse-linux-enterprise-server-for-sap-applications-15"
LABEL com.suse.release-stage="released"
# endlabelprefix
LABEL org.opencontainers.image.base.name="registry.suse.com/bci/bci-micro:${OS_VER}"
LABEL org.opencontainers.image.base.digest="latest"
LABEL io.artifacthub.package.logo-url="https://www.trento-project.io/images/trento-icon.svg"
LABEL io.artifacthub.package.readme-url="https://raw.githubusercontent.com/trento-project/web/refs/heads/main/packaging/suse/container/README.md"
# Erlang runtime dependencies
RUN zypper -n in libsystemd0 libopenssl3
WORKDIR /app
COPY --from=release /build/_build/$MIX_ENV/rel/trento .
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/trento"]
