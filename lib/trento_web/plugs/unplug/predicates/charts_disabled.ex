defmodule TrentoWeb.Plugs.Unplug.Predicates.ChartsDisabled do
  @moduledoc false

  @behaviour Unplug.Predicate

  @impl true
  def call(_, _), do: !Application.fetch_env!(:trento, Trento.Charts)[:enabled]
end
