import Config

import_config "dev.exs"

config :trento, Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher,
  connection: "amqp://wanda:wanda@localhost:5674"

config :trento, Trento.Infrastructure.Checks.AMQP.Consumer,
  connection: "amqp://wanda:wanda@localhost:5674"
