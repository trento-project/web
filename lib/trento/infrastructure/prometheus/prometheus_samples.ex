defmodule Trento.Infrastructure.Prometheus.PrometheusSamples do
  @required_fields :all

  use Trento.Support.Type

  deftype do
    field :timestamp, :utc_datetime_usec
    field :value, :float
  end
end
