defmodule Trento.Charts.ChartTimeSeries do
  @moduledoc """
   Represents a time series of a chart
   The series has a label and the samples distributed through time
  """
  @required_fields :all

  use Trento.Support.Type

  defmodule Sample do
    @required_fields :all

    use Trento.Support.Type

    deftype do
      field :timestamp, :decimal
      field :value, :decimal
    end
  end

  deftype do
    field :label, :string
    embeds_many :series, Sample
  end
end
