import Config

import_config "dev.exs"

config :trento, Trento.Messaging.Adapters.AMQP,
  publisher: [
    connection: "amqp://wanda:wanda@localhost:5674"
  ]

config :trento, Trento.Integration.Checks.Wanda.Messaging.AMQP,
  consumer: [
    connection: "amqp://wanda:wanda@localhost:5674"
  ]
