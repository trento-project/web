#!/bin/bash

set -e

readonly ARGS=("$@")
readonly NOW="$(date +%x_%H%M%S)"

indent() { sed 's/^/  /'; }

trento_configuration() {
    echo "===== TRENTO CONFIGURATION FILES ====="
    
    echo "/etc/trento/installer.conf content"
    echo "$(</etc/trento/installer.conf)" | indent

    echo "===== END TRENTO CONFIGURATION FILES ====="
}

base_system() {
    echo "===== BASE SYSTEM DETAILS ====="

    echo "k3s --version"
    k3s --version | indent
    echo "helm version"
    helm version | indent
    echo "helm get all trento-server"
    helm get all trento-server | indent

    echo "===== END BASE SYSTEM DETAILS ====="
}

kubernetes_state() {
    echo "===== KUBERNETES CLUSTER STATE ====="

    echo "kubectl get nodes -o wide"
    kubectl get nodes -o wide | indent
    echo "kubectl get pods"
    kubectl get pods | indent
    echo "kubectl logs deploy/trento-server-runner"
    kubectl logs deploy/trento-server-runner | indent
    echo "kubectl logs deploy/trento-server-web -c init"
    kubectl logs deploy/trento-server-web -c init | indent
    echo "kubectl logs deploy/trento-server-web"
    kubectl logs deploy/trento-server-web | indent
    echo "kubectl describe deployments"
    kubectl describe deployments | indent
    echo "crictl images"
    crictl images | indent
    
    echo "===== END KUBERNETES CLUSTER STATE ====="
}

######
# main
######

collect_all() {
    trento_configuration
    base_system
    kubernetes_state    
}

usage() {
    echo "Usage: $0 [base_system|kubernetes_state|collect_all]"
}

cmdline() {
    local arg=

    for arg; do
        local delim=""
        case "$arg" in
        --help) args="${args}-h " ;;
        --configuration) args="${args}-c " ;;
        --base) args="${args}-b " ;;
        --kubernetes) args="${args}-k " ;;
        --all) args="${args}-a " ;;

        # pass through anything else
        *)
            [[ "${arg:0:1}" == "-" ]] || delim="\""
            args="${args}${delim}${arg}${delim} "
            ;;
        esac
    done

    eval set -- "$args"

    while getopts "hcbka" OPTION; do
        case $OPTION in
        h)
            usage
            exit 0
            ;;

        c)
            trento_configuration > "$(date +%Y-%m-%d_%H:%M)_trento_config_support.txt"
            ;;

        b)
            base_system > "$(date +%Y-%m-%d_%H:%M)_trento_base_support.txt"
            ;;

        k)
            kubernetes_state > "$(date +%Y-%m-%d_%H:%M)_trento_kubernetes_support.txt"
            ;;

        a)
            collect_all > "$(date +%Y-%m-%d_%H:%M)_trento_all_support.txt"
            ;;

        *)
            usage
            exit 0
            ;;
        esac
    done

    return 0
}

cmdline "${ARGS[@]}"