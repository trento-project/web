defmodule TrentoWeb.V1.ActivityLogJSONTest do
  use ExUnit.Case

  import Trento.Factory

  alias Trento.ActivityLog.ActivityLog
  alias TrentoWeb.V1.ActivityLogJSON

  test "should render plain activity_log_entry.json" do
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
             ActivityLogJSON.activity_log_entry(%{
               activity_log_entry: activity_log_entry,
               current_user:
                 build(:user,
                   abilities: build_list(1, :ability, name: "activity_log", resource: "users")
                 )
             })
  end

  test "should render redacted activity_log_entry.json" do
    %ActivityLog{
      id: id,
      type: type,
      actor: _actor,
      metadata: metadata,
      inserted_at: inserted_at
    } = activity_log_entry = build(:activity_log_entry)

    assert %{
             id: ^id,
             type: ^type,
             actor: "••••••••",
             metadata: ^metadata,
             occurred_on: ^inserted_at
           } =
             ActivityLogJSON.activity_log_entry(%{
               activity_log_entry: activity_log_entry,
               current_user:
                 build(:user,
                   abilities: build_list(1, :ability, name: "foo", resource: "bar")
                 )
             })
  end
end
