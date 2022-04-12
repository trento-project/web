# Trento

An open cloud-native web console improving on the work day of SAP Applications administrators.

# Table of contents

- [Introduction](#introduction)
- [Features](#features)
  - [Automated discovery](#sap-hana-ha-automated-discovery)
  - [Reactive Control Plane](#reactive-control-plane)
  - [Configuration validation](#configuration-validation)
  - [Monitoring](#monitoring)
  - [Alerting](#alerting)
- [Installation](#installation)
- [Support](#support)
- [Contributing](#contributing)
- [License](#license)

# Introduction

_Trento_ is a comprehensive cloud-native, distributed monitoring solution.

It's made by three main components:

- Trento Agent
- Trento Runner
- Trento Web (current repository)

[Trento Agent](https://github.com/trento-project/agent) is a single background **process running in each host of the target** infrastructure the user desires to monitor.

[Trento Runner](https://github.com/trento-project/runner) responsible of **running the Trento configuration health checks** among the installed Trento Agents.

_Trento Web_ is the **control plane of the Trento Platform**.
In cooperation withe the Agents and the Runner dicovers, observes, monitors and checks the target SAP infrastructure.

See the [architecture document](./docs/architecture/trento-architecture.md) for additional details.

> Being the project in development, all of the above might be subject to change!

# Features
## SAP HANA HA Automated discovery

The central server integrates with the Agents discoveries by **collecting** information about the target SAP infrastructure and then **detects** different kind of scenarios and **reacts** accordingly.

See also [Trento Agent](https://github.com/trento-project/agent) for additional information.
## Reactive Control Plane

By leveraging modern approaches to software architecture and engineering and top notch technologies we built a **reactive system** that provides **realtime** feedbacks about the **changes in the target** infrastructure.

Here's a non-comprehensive list of the capabilities provided by the bundled Web UI:

- Global Health Overview
- Hosts Overview and Detail
- Pacemaker Clusters Overview and Detail
- SAP Systems Overview and Detail
- HANA Databases Overview and Detail 
- Checks Catalog
## Configuration validation

Trento is able to execute a variety of *configuration health checks* (a.k.a. the _HA Config Checks_) among the installed Trento Agents.

- Pacemaker, Corosync, SBD, SAPHanaSR and other generic _SUSE Linux Enterprise for SAP Application_ OS settings
- Specific configuration audits for SAP HANA Scale-Up Performance-Optimized scenarios deployed on MS Azure cloud.

See [Trento Runner](https://github.com/trento-project/runner) for additional information.

## Monitoring
It is important in critycal business systems to have access to relevant information about _how things are going_.

Currently Trento provides a basic integration with **Grafana** and **Prometheus**.

See [related documentation](./docs/monitoring/monitoring.md) for more information.

## Alerting
Alerting feature notifies the SAP Administrator about important updated in the Landscape being monitored/observed by Trento.

See [related documentation](./docs/alerting/alerting.md) for more information.

# Installation

_Trento_ is intended to run in many ways, depending on needs, and also the different components have their own requirements and constraints.

Please check the specific [Agent](https://github.com/trento-project/agent) and [Runner](https://github.com/trento-project/runner) documentations for respective details.

If you intend to install Trento on a k8s cluster, you may be interested in our [helm-charts](https://github.com/trento-project/helm-charts) repo for detailed instructions.

If otherwise you want to play around with the current repository, go ahead,  [hack on the trento](./docs/development/hack_on_the_trento.md) and **have a lot of fun**!

# Support

Please only report bugs via [GitHub issues](https://github.com/trento-project/web/issues);
for any other inquiry or topic use [GitHub discussion](https://github.com/trento-project/trento/discussions).

# Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

# License

Copyright 2021-2022 SUSE LLC

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.