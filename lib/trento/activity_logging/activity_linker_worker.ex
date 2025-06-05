defmodule Trento.ActivityLog.ActivityLinkerWorker do
  use Oban.Worker, queue: :activity_linker
  alias Commanded.Middleware.Auditing.CommandAudit
  import Ecto.Query

  @impl Oban.Worker
  def perform(%Oban.Job{
        args:
          %{
            "entry_id" => _entry_id,
            "causation_id" => _causation_id,
            "correlation_id" => _correlation_id
          } = _args
      }) do
    :ok
  end
end
