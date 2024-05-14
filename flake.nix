{
  description = "Trento Web";

  nixConfig.sandbox = "relaxed";
  inputs = {
    nixpkgs = { url = "github:NixOS/nixpkgs/nixos-unstable"; };
    flake-utils = { url = "github:numtide/flake-utils"; };
    devenv.url = "github:cachix/devenv";
    nixpkgs-old = { url = "github:NixOS/nixpkgs/c2c0373ae7abf25b7d69b2df05d3ef8014459ea3"; };
  };

  outputs = inputs@{ self, nixpkgs, flake-utils, devenv, nixpkgs-old }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        inherit (pkgs.lib) optional optionals;
        pkgs = nixpkgs.legacyPackages.${system};
        pkgs-old = nixpkgs-old.legacyPackages.${system};

        elixir = pkgs.beam.packages.erlang_26.elixir_1_15;
        beamPackages = pkgs.beam.packagesWith pkgs.beam.interpreters.erlang_26;

        src = ./.;
        version = "42.0.0";
        pname = "trento";

        mixFodDeps = beamPackages.fetchMixDeps {
          TOP_SRC = src;
          pname = "${pname}-mix-deps";
          inherit src version;
          hash = "sha256-lYXzsWQSgz90q01LfIqHlFhiZO0besGngVtqQ6hTtRM=";
          # hash = pkgs.lib.fakeHash;
        };

        nodejs = pkgs-old.nodejs-16_x-openssl_1_1;
        nodePackages = pkgs.buildNpmPackage {
          name = "trento-web";
          src = ./assets;
          buildInputs = with pkgs; [ cacert ];
          __noChroot = true;
          npmDepsHash = "sha256-GziGRbN823Ckj3DN2cGdvFc/AXETgVlSzIDpeWLpQX8=";
          # npmDepsHash = pkgs.lib.fakeHash;
          dontNpmBuild = true;
          inherit nodejs;


          installPhase = ''
            mkdir $out
            cp -r node_modules $out
            ln -s $out/node_modules/.bin $out/bin

          '';
        };

        pkg = beamPackages.mixRelease {
          TOP_SRC = src;
          inherit pname version elixir src mixFodDeps;

          postBuild = ''
            ln -sf ${mixFodDeps}/deps deps
            ln -sf ${nodePackages}/node_modules assets/node_modules
            export PATH="${pkgs.nodejs}/bin:${nodePackages}/bin:$PATH"
            ${nodejs}/bin/npm run deploy --prefix ./assets

            mix do deps.loadpaths --no-deps-check, phx.digest
            
          '';

        };

        postgres_port = 5433;
        process_compose_port = 7002;

        psql = pkgs.writeShellScriptBin "trentoweb_psql" ''
          exec "${pkgs.postgresql}/bin/psql" --host "$DATABASE_HOST" --user "$DATABASE_USER" --port "$DATABASE_PORT" "$DATABASE_NAME" "$@"
        '';
        psql_eventstore = pkgs.writeShellScriptBin "trentoweb_eventstore_psql" ''
          exec "${pkgs.postgresql}/bin/psql" --host "$DATABASE_HOST" --user "$DATABASE_USER" --port "$DATABASE_PORT" "$EVENTSTORE_DATABASE_NAME" "$@"
        '';

        devShell = devenv.lib.mkShell {
          inherit inputs pkgs;
          modules = with pkgs; [{
            packages = [
              dbeaver
              elixir
              elixir_ls
              insomnia
              nodejs
              jq
              psql
              psql_eventstore
            ] ++ optional stdenv.isLinux inotify-tools
            ++ optional stdenv.isDarwin terminal-notifier
            ++ optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
              CoreFoundation
              CoreServices
            ]);

            enterShell = ''
              echo "Welcome to Trento Web"
              export  PORT="4000"
              export  DATABASE_USER="postgres"
              export  DATABASE_PASS="postgres"
              export  DATABASE_NAME="trento_dev"
              export  EVENTSTORE_DATABASE_NAME="trento_eventstore_dev"
              export  DATABASE_HOST="127.0.0.1"
              export  DATABASE_PORT="${toString postgres_port}"
              export  RELEASE_COOKIE="1234567890123456789"
            '';

            enterTest = ''
              mix test
            '';
            process.process-compose = {
              port = process_compose_port;
              unix-socket = 9999;
              package = pkgs.process-compose;
              tui = true;
            };
            services.postgres = {
              enable = true;
              package = pkgs.postgresql_15;
              listen_addresses = "127.0.0.1";
              port = postgres_port;
              initialDatabases = [{ name = "trento_dev"; } { name = "trento_eventstore_dev"; }];
              initialScript = ''
                CREATE ROLE postgres WITH LOGIN PASSWORD 'postgres' SUPERUSER;
              '';
            };
            services.rabbitmq = {
              enable = true;
              port = 5673;
              nodeName = "trento@localhost";
              managementPlugin.enable = true;
              managementPlugin.port = 15673;
              configItems = {
                "default_user" = "trento";
                "default_pass" = "trento";
              };

            };
          }];

        };
      in
      {
        packages = {
          devenv-up = devShell.config.procfileScript;
          default = pkg;
        };
        devShells.default = devShell;
      });
}

