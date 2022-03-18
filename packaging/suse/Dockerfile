FROM registry.suse.com/bci/nodejs:16 AS assets-build
ADD assets /build/assets
WORKDIR /build/assets
RUN npm install

FROM registry.suse.com/bci/bci-base:15.3 AS elixir-build 
RUN zypper -n addrepo https://download.opensuse.org/repositories/devel:/languages:/erlang/SLE_15_SP3/devel:languages:erlang.repo
RUN zypper -n --gpg-auto-import-keys ref -s
RUN zypper -n in elixir
ADD . /build
COPY --from=assets-build /build/assets /build/assets
WORKDIR /build
ENV MIX_ENV=dev
RUN mix local.rebar --force \
    && mix local.hex --force \
    && mix deps.get
RUN mix release


FROM registry.suse.com/bci/bci-base:15.3 AS trento
WORKDIR /app
COPY --from=elixir-build /build/_build/dev/rel/trento/ .
EXPOSE 4000/tcp
ENTRYPOINT ["/app/bin/trento"]
