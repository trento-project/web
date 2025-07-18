defmodule Trento.Infrastructure.Commanded.EventHandlers.ActivityLogEventHandlerTest do
  @moduledoc false
  use Trento.DataCase

  import Trento.Factory

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Infrastructure.Commanded.EventHandlers.ActivityLogEventHandler

  test "should log a domain event" do
    event = build(:host_checks_health_changed)

    correlation_id = UUID.uuid4()

    assert :ok == ActivityLogEventHandler.handle(event, %{correlation_id: correlation_id})

    assert [
             %ActivityLog{
               type: "host_checks_health_changed",
               actor: "system"
             }
           ] = Trento.Repo.all(ActivityLog)
  end
end
