defmodule Trento.Correlations.CorrelationStub do
  @behaviour Trento.ActivityLog.Correlations

  def get_correlation_id(_key), do: UUID.uuid4()
  def put_correlation_id(_key, _value), do: :ok
  def expire_correlation_id(_key, _ttl), do: :ok
end
