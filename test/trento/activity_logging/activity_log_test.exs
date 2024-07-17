defmodule Trento.ActivityLog.ActivityLogTest do
  @moduledoc false
  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  import Ecto.Query
  import Trento.Factory

  alias Trento.Repo

  alias Trento.ActivityLog
  alias Trento.ActivityLog.ActivityLog, as: ActivityLogSchema
  alias Trento.ActivityLog.RetentionTime

  describe "clear_expired_logs" do
    # Each scenario checks some logs against a specific retention time.
    # It's a struct with the following fields:
    # - name: the scenario name
    # - retention_time: the retention time to be set as a context for the test
    # - expired_entry_dates: a list of dates that are expected to be expired according to the retention time
    # - valid_entry_dates: a list of dates that are expected not to be expired according to the retention time
    # As expiration is calculated based on the current date, the dates are calculated as the difference from now.
    cleaning_scenarios = [
      %{
        name: "one day",
        retention_time: %RetentionTime{
          value: 1,
          unit: :day
        },
        expired_entry_dates: [
          # 2 days ago
          DateTime.add(DateTime.utc_now(), -2, :day)
        ],
        valid_entry_dates: [
          # 12 hours ago
          DateTime.add(DateTime.utc_now(), -12 * 60 * 60, :second)
        ]
      },
      %{
        name: "two days",
        retention_time: %RetentionTime{
          value: 2,
          unit: :day
        },
        expired_entry_dates: [
          # 2 days and 1 second ago
          DateTime.add(DateTime.utc_now(), -2 * 24 * 60 * 60 - 1, :second)
        ],
        valid_entry_dates: [
          # 1 day ago
          DateTime.add(DateTime.utc_now(), -1, :day)
        ]
      },
      %{
        name: "one week",
        retention_time: %RetentionTime{
          value: 1,
          unit: :week
        },
        expired_entry_dates: [
          # 1 week and 1 second ago
          DateTime.add(DateTime.utc_now(), -7 * 24 * 60 * 60 - 1, :second)
        ],
        valid_entry_dates: [
          # 3 days ago
          DateTime.add(DateTime.utc_now(), -3, :day)
        ]
      },
      %{
        name: "one month",
        retention_time: %RetentionTime{
          value: 1,
          unit: :month
        },
        expired_entry_dates: [
          # 1 month and 1 second ago
          DateTime.add(DateTime.utc_now(), -30 * 24 * 60 * 60 - 1, :second)
        ],
        valid_entry_dates: [
          # 20 days ago
          DateTime.add(DateTime.utc_now(), -20, :day)
        ]
      },
      %{
        name: "two months",
        retention_time: %RetentionTime{
          value: 2,
          unit: :month
        },
        expired_entry_dates: [
          # 2 months and 1 second ago
          DateTime.add(DateTime.utc_now(), -2 * 30 * 24 * 60 * 60 - 1, :second)
        ],
        valid_entry_dates: [
          # 1 month ago
          DateTime.add(DateTime.utc_now(), -30, :day)
        ]
      },
      %{
        name: "two years",
        retention_time: %RetentionTime{
          value: 2,
          unit: :year
        },
        expired_entry_dates: [
          # 2 years and 1 second ago
          DateTime.add(DateTime.utc_now(), -2 * 365 * 24 * 60 * 60 - 1, :second)
        ],
        valid_entry_dates: [
          # 1 year ago
          DateTime.add(DateTime.utc_now(), -365, :day)
        ]
      }
    ]

    for %{name: name} = scenario <- cleaning_scenarios do
      @scenario scenario

      test "clear expired logs with #{name} retention" do
        %{
          expired_entry_dates: expired_entry_dates,
          valid_entry_dates: valid_entry_dates,
          retention_time: retention_time
        } =
          @scenario

        # set the context
        insert(:activity_log_settings,
          retention_time: retention_time
        )

        # given a list of dated expected to be expired,
        # add a log entry for each date
        expired_entry_ids =
          expired_entry_dates
          |> Enum.map(fn date ->
            insert(:activity_log_entry,
              inserted_at: date
            )
          end)
          |> Enum.map(fn %{id: id} -> id end)

        # given a list of dated expected not to be expired,
        # add a log entry for each date
        # now() is always added to the list
        valid_entry_ids =
          [DateTime.utc_now() | valid_entry_dates]
          |> Enum.map(fn date ->
            insert(:activity_log_entry,
              inserted_at: date
            )
          end)
          |> Enum.map(fn %{id: id} -> id end)

        # clear logs due to the retention time
        ActivityLog.clear_expired_logs()

        # check every expired log entry has been deleted
        for expired_entry_id <- expired_entry_ids do
          assert nil == Repo.one(from l in ActivityLogSchema, where: l.id == ^expired_entry_id)
        end

        # check every valid log entry has not been deleted
        for valid_entry_id <- valid_entry_ids do
          assert %{id: ^valid_entry_id} =
                   Repo.one(from l in ActivityLogSchema, where: l.id == ^valid_entry_id)
        end
      end
    end
  end
end
