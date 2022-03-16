#!/bin/bash

set -e

readonly ARGS=("$@")

usage() {
    cat <<-EOF
    usage: dump_scenario_from_k8s.sh options

    Dump the current scenario from a running trento-server installation on the k8s cluster

    OPTIONS:
        -n, --name            The name to use for the scenario. Defaults to "current".
        -p, --path            The path where the scenario should be saved. Defaults to the current directory.
        -h, --help            Print this help.

    Example:
        dump_scenario_from_k8s.sh --name failover --path /tmp
EOF
}

cmdline() {
    local arg=

    for arg; do
        local delim=""
        case "$arg" in
        --name) args="${args}-n " ;;
        --path) args="${args}-p " ;;
        --help) args="${args}-h " ;;

        # pass through anything else
        *)
            [[ "${arg:0:1}" == "-" ]] || delim="\""
            args="${args}${delim}${arg}${delim} "
            ;;
        esac
    done

    eval set -- "$args"

    while getopts "n:p:h" OPTION; do
        case $OPTION in
        h)
            usage
            exit 0
            ;;
        n)
            readonly NAME=$OPTARG
            ;;
        p)
            readonly EXPORT_PATH=$OPTARG
            ;;
        *)
            usage
            exit 0
            ;;
        esac
    done

    return 0
}

dump-scenario() {
    local name=${NAME:-current}
    local path="${EXPORT_PATH:-$PWD}"

    if [[ -d "$path/scenarios/$name" ]]; then
        echo "The scenario $name already exists in $path/scenarios/$name"
        echo "Please choose a different name."
        exit 1
    fi

    kubectl exec deploy/trento-server-web -- rm -rf /scenarios
    kubectl exec -ti deploy/trento-server-web -- /app/bin/tronto eval "Tronto.Release.dump_scenario([\"$name\", \"-p\", \"/scenarios\"])"
    kubectl exec deploy/trento-server-web -- tar cf - scenarios | tar xf - -C "$path"
}

main() {
    cmdline "${ARGS[@]}"
    dump-scenario
}

main
