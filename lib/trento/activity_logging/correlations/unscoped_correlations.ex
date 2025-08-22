defmodule Trento.ActivityLog.Correlations.UnscopedCorrelations do
  @moduledoc """
  For usage in application code.
  """

  @cache_name :activity_correlations
  @api_key_regen "api_key_regen"
  @suse_manager_settings "suse_manager_settings"
  @default_ttl 15_000

  @behaviour Trento.ActivityLog.Correlations

  @impl true
  def correlation_key(:api_key), do: @api_key_regen
  def correlation_key(:suse_manager_settings), do: @suse_manager_settings

  @impl true
  @spec put_correlation_id(binary(), binary()) :: :ok
  def put_correlation_id(key, value) do
    _ = Cachex.put(@cache_name, key, value)
    :ok
  end

  @impl true
  @spec get_correlation_id(binary()) :: binary() | nil
  def get_correlation_id(key) do
    with {:ok, maybe_value} <- Cachex.get(@cache_name, key) do
      maybe_value
    end
  end

  @impl true
  @spec expire_correlation_id(binary(), non_neg_integer()) :: :ok
  def expire_correlation_id(key, ttl \\ @default_ttl) do
    # ttl unit is milliseconds
    _ = Cachex.expire(@cache_name, key, ttl)
    :ok
  end
end
