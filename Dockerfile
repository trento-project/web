FROM registry.suse.com/bci/nodejs:16 AS assets-build
ADD assets /build/assets
WORKDIR /build/assets
RUN npm install
RUN npm run tailwind:build
RUN npm run build

FROM opensuse/leap AS elixir-build
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN zypper -n addrepo https://download.opensuse.org/repositories/devel:/languages:/erlang/SLE_15_SP3/devel:languages:erlang.repo
RUN zypper -n --gpg-auto-import-keys ref -s
RUN zypper -n in elixir
ADD . /build
COPY --from=assets-build /build/priv/static /build/priv/static
WORKDIR /build
ENV MIX_ENV=prod
RUN mix local.rebar --force \
    && mix local.hex --force \
    && mix deps.get
RUN mix phx.digest
RUN mix release


FROM registry.suse.com/bci/bci-base:15.3 AS tronto
WORKDIR /app
COPY --from=elixir-build /build/_build/prod/rel/tronto/ .
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/tronto"]
