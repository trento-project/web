{ pkgs, inputs, ... }:

let
  # pkgs-unstable = import inputs.nixpkgs_unstable { system = pkgs.stdenv.system; };
  pkgs-old = import inputs.nixpkgs_old { system = pkgs.stdenv.system; };
  pkgs-stable = import inputs.nixpkgs_stable { system = pkgs.stdenv.system; };
in
{
  # https://devenv.sh/basics/
  env.GREET = "Trento Web";
  env.PHOTOFINISH_BINARY = "./photofinish";
  # https://devenv.sh/packages/
  packages = with pkgs-stable; [ cypress openssl ];

  # https://devenv.sh/scripts/
  scripts.hello.exec = "echo hello from $GREET";

  enterShell = ''
    hello
    export CYPRESS_INSTALL_BINARY=0
    export CYPRESS_RUN_BINARY=${pkgs-stable.cypress}/bin/Cypress
    iex --version
    rustc --version
  '';

  # https://devenv.sh/tests/
  enterTest = ''
    echo "Running tests"
    iex --version | grep "1.15"
    iex --version | grep "26"
  '';

  # https://devenv.sh/languages/
  languages.elixir.enable = true;
  languages.elixir.package = pkgs-stable.beam.packages.erlang_26.elixir_1_15;

  languages.javascript.enable = true;
  languages.javascript.package = pkgs-old.nodejs-16_x-openssl_1_1;

  # See full reference at https://devenv.sh/reference/options/
}
