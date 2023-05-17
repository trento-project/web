# Trento

[![CI](https://github.com/trento-project/web/actions/workflows/ci.yaml/badge.svg)](https://github.com/trento-project/web/actions/workflows/ci.yaml)
[![Coverage Status](https://coveralls.io/repos/github/trento-project/web/badge.svg?branch=main)](https://coveralls.io/github/trento-project/web?branch=main)
[![Documentation](https://img.shields.io/badge/documentation-grey.svg)](https://trento-project.io/web/)

An open cloud-native web console aiming to improve the workday of SAP Applications administrators.

# Documentation

The documentation is available at [trento-project.io/web](https://trento-project.io/web/).

Swagger UI is available at [trento-project.io/web/swaggerui](https://trento-project.io/web/swaggerui).

# Overview of Trento

**Trento** is a comprehensive cloud-native, distributed monitoring solution, and it consists of three main components:

- [Agent](https://github.com/trento-project/agent): Single background **process that runs on each host in the target infrastructure**
- [Wanda](https://github.com/trento-project/wanda): Responsible to **orchestrate _checks_ executions** on a target infrastructure among the installed Trento Agents.
- [Web](https://github.com/trento-project/web) (current repository): The control plane of the Trento Platform, which works in conjunction with the Agents and Wanda to **discover, observe, monitor, and check** the target SAP infrastructure.

## Trento architecture

See the [architecture document](https://github.com/trento-project/docs/blob/main/guides/architecture/trento-architecture.md) for additional details.

# Features of Trento

## SAP HANA HA Automated discovery

The central server integrates with the agents discoveries by **collecting** information about the target SAP infrastructure and then **detects** different kinds of scenarios and **reacts** accordingly.

See also [Trento Agent](https://github.com/trento-project/agent) for additional information.

## Configuration validation

Trento is able to execute a variety of _configuration health checks_ (a.k.a. the _HA Config Checks_) among the installed Trento Agents.

- Pacemaker, Corosync, SBD, SAPHanaSR and other generic _SUSE Linux Enterprise for SAP Application_ OS settings
- Specific configuration audits for SAP HANA Scale-Up Performance-Optimized scenarios deployed on MS Azure cloud.

See [Trento Wanda](https://github.com/trento-project/wanda) for additional information.

## Reactive Control Plane

By leveraging modern approaches to software architecture and engineering and top-notch technologies, we built a **reactive system** that provides **real-time** feedback about the **changes in the target** infrastructure.

Here's a non-comprehensive list of the capabilities provided by the [Trento Web](https://github.com/trento-project/web) UI:

- Global Health Overview
- Hosts Overview and Detail
- Pacemaker Clusters Overview and Detail
- SAP Systems Overview and Detail
- HANA Databases Overview and Detail
- Checks Catalog

## Monitoring

It is important in critical business systems to have access to relevant information about _how things are going_.
Currently, Trento provides basic integration with **Grafana** and **Prometheus**.

See [related documentation](./guides/monitoring/monitoring.md) for more information.

## Alerting

Alerting feature notifies the SAP Administrator about important updates in the Landscape being monitored/observed by Trento.

See [related documentation](./guides/alerting/alerting.md) for more information.

# Installation

**Trento** can be installed in various ways, depending on your needs and the requirements of its different components. Please refer to the specific [Agent](https://github.com/trento-project/agent) documentation for more information.

## Installing Trento on a k8s Cluster

For detailed instructions on installing Trento on a k8s cluster, please refer to our [helm-charts](https://github.com/trento-project/helm-charts) repository.

## Installing Trento Web locally for Development

To install Trento Web locally for development, please refer to our [hack on the Trento Web](./guides/development/hack_on_the_trento.md) guide for detailed instructions.

# Support

Please only report bugs via [GitHub issues](https://github.com/trento-project/web/issues).

# Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

# License

Copyright 2021-2023 SUSE LLC

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
