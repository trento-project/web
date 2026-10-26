defmodule Trento.Hosts.HostChecksScheduleTest do
  use Trento.AggregateCase, aggregate: Trento.Hosts.Host, async: true

  import Trento.Factory

  alias Trento.Hosts.Commands.UpdateHostChecksSchedule
  alias Trento.Hosts.Events.HostChecksScheduleUpdated
  alias Trento.Hosts.Host

  @window %{
    "starts_at" => "2026-11-02T22:00:00Z",
    "timezone" => "Etc/UTC",
    "duration_minutes" => 60,
    "recurrence" => nil
  }

  test "should update the checks schedule of a host" do
    host_id = UUID.uuid4()

    assert_events_and_state(
      build(:host_registered_event, host_id: host_id),
      UpdateHostChecksSchedule.new!(%{
        host_id: host_id,
        interval: "6h",
        exception_window: @window
      }),
      [%HostChecksScheduleUpdated{host_id: host_id, interval: "6h", exception_window: @window}],
      fn host ->
        assert %Host{checks_interval: "6h", checks_exception_window: @window} = host
      end
    )
  end

  test "should not update the checks schedule of an unknown host" do
    assert_error(
      UpdateHostChecksSchedule.new!(%{
        host_id: UUID.uuid4(),
        interval: nil,
        exception_window: nil
      }),
      {:error, :host_not_registered}
    )
  end
end
