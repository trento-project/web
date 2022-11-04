# FIXME: Temporary dev solution while wanda is being integrated in the dashboard
import Config

import_config "dev.exs"

config :trento, :messaging, adapter: Trento.Messaging.Adapters.AMQP

config :trento, Trento.Integration.Checks, adapter: Trento.Integration.Checks.Wanda

config :trento, Trento.Messaging.Publisher, adapter: Trento.Messaging.Adapters.AMQP

config :trento, Trento.Messaging.Adapters.AMQP,
  publisher: [
    exchange: "trento.checks",
    connection: "amqp://trento:trento@localhost:5672"
  ]

config :trento, Trento.Integration.Checks.Wanda.Messaging.AMQP,
  processor: Trento.Integration.Checks.Wanda.Messaging.AMQP.Processor,
  consumer: [
    queue: "trento.checks.results",
    exchange: "trento.checks",
    routing_key: "results",
    prefetch_count: "10",
    connection: "amqp://trento:trento@localhost:5672",
    retry_delay_function: fn attempt -> :timer.sleep(2000 * attempt) end
  ]

config :trento, :extra_children, [
  Trento.Messaging.Adapters.AMQP.Publisher,
  Trento.Integration.Checks.Wanda.Messaging.AMQP.Consumer
]
