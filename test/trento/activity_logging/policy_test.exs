defmodule Trento.ActivityLog.PolicyTest do
  use ExUnit.Case

  import Trento.Factory

  alias Trento.ActivityLog.Policy

  describe "Activity Log Policy" do
    test "users with relevant permissions should be allowed to access all logs" do
      scenarios = [
        %{
          abilities: [
            %{name: "all", resource: "all"},
            %{name: "foo", resource: "bar"}
          ],
          should_have_access_to_all_logs: true
        },
        %{
          abilities: [
            %{name: "all", resource: "users"},
            %{name: "foo", resource: "bar"}
          ],
          should_have_access_to_all_logs: true
        },
        %{
          abilities: [
            %{name: "foo", resource: "bar"}
          ],
          should_have_access_to_all_logs: false
        }
      ]

      for %{abilities: abilities, should_have_access_to_all_logs: should_have_access_to_all_logs} <-
            scenarios do
        assert should_have_access_to_all_logs ==
                 abilities
                 |> build_user_with_abilities()
                 |> Policy.include_all_logs?()
      end
    end

    test "users with relevant permissions should be allowed to access actor names in logs" do
      scenarios = [
        %{
          abilities: [
            %{name: "all", resource: "all"},
            %{name: "foo", resource: "bar"}
          ],
          should_have_access_to_actor_names: true
        },
        %{
          abilities: [
            %{name: "all", resource: "users"},
            %{name: "foo", resource: "bar"}
          ],
          should_have_access_to_actor_names: true
        },
        %{
          abilities: [
            %{name: "activity_log", resource: "users"},
            %{name: "foo", resource: "bar"}
          ],
          should_have_access_to_actor_names: true
        },
        %{
          abilities: [
            %{name: "foo", resource: "bar"}
          ],
          should_have_access_to_actor_names: false
        }
      ]

      for %{
            abilities: abilities,
            should_have_access_to_actor_names: should_have_access_to_actor_names
          } <- scenarios do
        assert should_have_access_to_actor_names ==
                 abilities
                 |> build_user_with_abilities()
                 |> Policy.has_access_to_users?()
      end
    end
  end

  defp build_user_with_abilities(abilities),
    do:
      build(:user,
        abilities: Enum.map(abilities, &build(:ability, name: &1.name, resource: &1.resource))
      )
end
