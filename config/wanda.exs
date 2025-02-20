import Config

import_config "dev.exs"

config :trento, Trento.Infrastructure.Messaging.Adapter.AMQP,
  checks: [
    consumer: [
      connection: "amqp://wanda:wanda@localhost:5674"
    ],
    publisher: [
      connection: "amqp://wanda:wanda@localhost:5674"
    ]
  ],
  operations: [
    consumer: [
      connection: "amqp://wanda:wanda@localhost:5674"
    ],
    publisher: [
      connection: "amqp://wanda:wanda@localhost:5674"
    ]
  ]
