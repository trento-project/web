#!/bin/bash

set -e

readonly COMMAND=("$1")
readonly ARGS=("${@:2}")

usage() {
    cat <<-EOF
    usage: dump_data_from_k8s.sh options

    Dump data from a running trento-server installation on the k8s cluster

    Available commands:
        scenario              Dump the current scenario
        unaccepted-events     Dump unaccepted events

    Options:
        -n, --name            The name to use for the scenario. Defaults to "current".
        -p, --path            The path where the scenario should be saved. Defaults to the current directory.
        -e, --event-number    The number of unaccepted events to dump. Defaults to 10.
        -h, --help            Print this help.

    Example:
        dump_data_from_k8s.sh scenario --name failover --path /tmp
        dump_data_from_k8s.sh unaccepted-events --name failed_events --path /tmp --event-number 5
EOF
}

cmdline() {
    local arg=

    for arg; do
        local delim=""
        case "$arg" in
        --name) args="${args}-n " ;;
        --path) args="${args}-p " ;;
        --event-number) args="${args}-e " ;;
        --help) args="${args}-h " ;;

        # pass through anything else
        *)
            [[ "${arg:0:1}" == "-" ]] || delim="\""
            args="${args}${delim}${arg}${delim} "
            ;;
        esac
    done

    eval set -- "$args"

    while getopts "n:p:e:h" OPTION; do
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
        e)
            readonly EVENT_NUMBER=$OPTARG
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
    local local_path="/scenarios"

    if [[ -d "$path/$local_path/$name" ]]; then
        echo "The scenario $name already exists in $path/$local_path/$name"
        echo "Please choose a different name."
        exit 1
    fi

    kubectl exec deploy/trento-server-web -- rm -rf $local_path
    kubectl exec -ti deploy/trento-server-web -- /app/bin/trento eval "Trento.Release.dump_scenario([\"$name\", \"-p\", \"$local_path\"])"
    kubectl exec deploy/trento-server-web -- tar cf - $local_path | tar xf - -C "$path"
}

dump-unaccepted-events() {
    local name=${NAME:-current}
    local path="${EXPORT_PATH:-$PWD}"
    local event_number="${EVENT_NUMBER:=10}"
    local local_path="/unaccepted_events"

    if [[ -d "$path/$local_path/$name" ]]; then
        echo "The unaccepted events folder $name already exists in $path/$local_path/$name"
        echo "Please choose a different name."
        exit 1
    fi

    kubectl exec deploy/trento-server-web -- rm -rf $local_path
    kubectl exec -ti deploy/trento-server-web -- /app/bin/trento eval "Trento.Release.dump_unaccepted_events([\"$name\", \"-p\", \"$local_path\", \"-n\", \"$event_number\"])"
    kubectl exec deploy/trento-server-web -- tar cf - $local_path | tar xf - -C "$path"
}

main() {
    cmdline "${ARGS[@]}"
    case $COMMAND in
    scenario)
        dump-scenario
        ;;
    unaccepted-events)
        dump-unaccepted-events
        ;;
    *)
        usage
        exit 0
        ;;
    esac
}

main
