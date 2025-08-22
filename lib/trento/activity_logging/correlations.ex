defmodule Trento.ActivityLog.Correlations do
  @moduledoc false

  @callback correlation_key(ctx :: atom()) :: binary()
  @callback get_correlation_id(key :: binary()) :: binary() | nil
  @callback put_correlation_id(key :: binary(), value :: binary()) :: :ok
  @callback expire_correlation_id(key :: binary(), ttl :: integer()) :: :ok
  def correlation_key(ctx), do: impl().correlation_key(ctx)
  def get_correlation_id(key), do: impl().get_correlation_id(key)
  def put_correlation_id(key, value), do: impl().put_correlation_id(key, value)
  def expire_correlation_id(key, ttl), do: impl().expire_correlation_id(key, ttl)

  defp impl,
    do:
      Application.get_env(
        :trento,
        :correlations,
        Trento.ActivityLog.Correlations.UnscopedCorrelations
      )
end
