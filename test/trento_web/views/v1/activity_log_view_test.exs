defmodule TrentoWeb.V1.ActivityLogViewTest do
  use ExUnit.Case

  import Trento.Factory

  alias Trento.ActivityLog.ActivityLog
  alias TrentoWeb.V1.ActivityLogView

  test "should render activity_log_entry.json" do
    %ActivityLog{
      id: id,
      type: type,
      actor: actor,
      metadata: metadata,
      inserted_at: inserted_at
    } = activity_log_entry = build(:activity_log_entry)

    assert %{
             id: ^id,
             type: ^type,
             actor: ^actor,
             metadata: ^metadata,
             occurred_on: ^inserted_at
           } =
             ActivityLogView.render("activity_log_entry.json", %{
               activity_log_entry: activity_log_entry
             })
  end
end
