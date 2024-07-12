defmodule TrentoWeb.V1.ActivityLogViewTest do
  use ExUnit.Case

  import Phoenix.View

  import Trento.Factory

  alias Trento.ActivityLog.ActivityLog
  alias TrentoWeb.V1.ActivityLogView

  test "should render activity_log.json" do
    [
      %ActivityLog{
        id: id1,
        type: type1,
        actor: actor1,
        metadata: metadata1,
        inserted_at: inserted_at1
      },
      %ActivityLog{
        id: id2,
        type: type2,
        actor: actor2,
        metadata: metadata2,
        inserted_at: inserted_at2
      }
    ] = activity_log = build_list(2, :activity_log_entry)

    assert [
             %{
               id: ^id1,
               type: ^type1,
               actor: ^actor1,
               metadata: ^metadata1,
               occurred_on: ^inserted_at1
             },
             %{
               id: ^id2,
               type: ^type2,
               actor: ^actor2,
               metadata: ^metadata2,
               occurred_on: ^inserted_at2
             }
           ] = render(ActivityLogView, "activity_log.json", %{activity_log: activity_log})
  end

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
             render(ActivityLogView, "activity_log_entry.json", %{
               activity_log_entry: activity_log_entry
             })
  end
end
