defmodule Trento.Support.CommandedUtils do
  @moduledoc false
  alias Trento.ActivityLog

  def commanded, do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]

  def maybe_correlated_dispatch(command, ctx \\ :uncorrelated_dispatch) do
    case ctx == :uncorrelated_dispatch do
      false ->
        key = ActivityLog.correlation_key(ctx)

        case ActivityLog.get_correlation_id(key) do
          nil ->
            # in case the correlation_id entry has expired
            # or is absent we do the default dispatch
            commanded().dispatch(command)

          correlation_id ->
            # in case correlation_id exists, we
            # pass it on to the dispatch function
            commanded().dispatch(command,
              correlation_id: correlation_id,
              causation_id: correlation_id
            )
        end

      true ->
        commanded().dispatch(command)
    end
  end

  def correlated_dispatch(command) do
    correlation_id = Process.get(:correlation_id)
    commanded().dispatch(command, correlation_id: correlation_id, causation_id: correlation_id)
  end
end
