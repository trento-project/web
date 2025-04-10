import Config

import_config "dev.exs"

amqp_connection =
  if System.get_env("USE_LOCAL_RABBIT_TLS") do
    "amqps://wanda:wanda@localhost:5676?certfile=container_fixtures/rabbitmq/certs/client_web.trento.local_certificate.pem&keyfile=container_fixtures/rabbitmq/certs/client_web.trento.local_key.pem&verify=verify_peer&cacertfile=container_fixtures/rabbitmq/certs/ca_certificate.pem"
  else
    "amqp://wanda:wanda@localhost:5674"
  end

config :trento, Trento.Infrastructure.Messaging.Adapter.AMQP,
  checks: [
    consumer: [
      connection: amqp_connection
    ],
    publisher: [
      connection: amqp_connection
    ]
  ],
  operations: [
    consumer: [
      connection: amqp_connection
    ],
    publisher: [
      connection: amqp_connection
    ]
  ],
  catalog: [
    consumer: [
      connection: amqp_connection
    ]
  ],
  discoveries: [
    publisher: [
      connection: amqp_connection
    ]
  ]
