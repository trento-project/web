defmodule Trento.Infrastructure.Prometheus.PrometheusSamples do
  @moduledoc """
  PrometheusSamples represent a prometheus sample returned from a range query, having a unix timestamp and a float value
  """
  @required_fields :all

  use Trento.Support.Type

  deftype do
    field :timestamp, :utc_datetime_usec
    field :value, :float
  end
end
