defmodule Trento.ActivityLog.Correlations do
  @moduledoc false

  @cache_name :activity_correlations
  @api_key_regen "api_key_regen"
  @default_ttl 15_000

  def correlation_key(:api_key) do
    # Allow fetching the correlation key provisioned from the calling
    # process to prevent leakge of the key across test process boundaries.
    case Process.get(:correlation_key) do
      nil ->
        # non-test scenario, where we want the key to be static
        @api_key_regen

      key when is_binary(key) ->
        # test scenario, where we want the key to be owned per-test process
        key
    end
  end

  @spec put_correlation_id(binary(), binary()) :: :ok
  def put_correlation_id(key, value) do
    _ = Cachex.put(@cache_name, key, value)
    :ok
  end

  @spec get_correlation_id(binary()) :: binary() | nil
  def get_correlation_id(key) do
    with {:ok, maybe_value} <- Cachex.get(@cache_name, key) do
      maybe_value
    end
  end

  @spec expire_correlation_id(binary(), non_neg_integer()) :: :ok
  def expire_correlation_id(key, ttl \\ @default_ttl)
      when is_binary(key) do
    # ttl unit is milliseconds
    _ = Cachex.expire(@cache_name, key, ttl)
    :ok
  end
end
