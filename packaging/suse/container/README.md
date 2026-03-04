# Trento Web Container Image

## Description

_Trento_ is a bespoke, stand-alone web application, built by SUSE from the ground up, to facilitate SAP operations, proactively preventing infrastructural issues by diagnosing common configuration mistakes by validating systems against SUSE best practices. It's meant to complement [SUSE Linux Enterprise Server for SAP applications](https://www.suse.com/products/sles-for-sap/) in helping IT organizations run mission-critical enterprise software.

## Usage

Trento Web exposes its HTTP endpoint on port `4000`.

To run Trento Web using the container image:

```console
docker run -d \
  --name trento-web \
  -p 4000:4000 \
  -e DATABASE_URL='ecto://trento_user:web_password@postgres-host/trento' \
  -e EVENTSTORE_URL='ecto://trento_user:web_password@postgres-host/trento_event_store' \
  -e AMQP_URL='amqp://trento_user:trento_user_password@rabbitmq-host/vhost' \
  -e SECRET_KEY_BASE='<secret-key-base>' \
  -e ACCESS_TOKEN_ENC_SECRET='<access-token-enc-secret>' \
  -e REFRESH_TOKEN_ENC_SECRET='<refresh-token-enc-secret>' \
  -e TRENTO_WEB_ORIGIN='localhost' \
  -e CHECKS_SERVICE_BASE_URL='http://wanda-host:4000' \
  registry.suse.com/trento/trento-web
```

Open Trento Web at `http://localhost:4000`.

Refer to the [official SUSE documentation](https://documentation.suse.com/sles-sap/trento/html/SLES-SAP-trento/index.html) for detailed installation and configuration instructions.

## Licensing

`SPDX-License-Identifier: Apache-2.0`

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/trento-project/web/blob/main/LICENSE) file for details.
