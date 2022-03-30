defmodule Trento.Integration.ChecksTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  alias Trento.Integration.Checks

  alias Trento.Integration.Checks.Models.{
    Catalog,
    Check,
    FlatCatalog,
    FlatCheck,
    Group,
    Provider
  }

  @runner_fixtures_path File.cwd!() <> "/test/fixtures/runner"

  def load_runner_fixture(name) do
    @runner_fixtures_path
    |> Path.join("#{name}.json")
    |> File.read!()
    |> Jason.decode!()
  end

  test "should return an error if the runner is not reachable" do
    expect(Trento.Integration.Checks.Mock, :get_catalog, fn ->
      {:error, "some error"}
    end)

    assert {:error, "some error"} = Checks.get_catalog()
  end

  test "should return not ready if the runner is still building the catalog" do
    expect(Trento.Integration.Checks.Mock, :get_catalog, fn ->
      {:error, :not_ready}
    end)

    assert {:error, "The catalog is still being built. Try again in some moments"} =
             Checks.get_catalog()
  end

  test "should return a flat catalog" do
    raw_catalog = load_runner_fixture("catalog")

    Trento.Integration.Checks.Mock
    |> expect(:get_catalog, fn -> {:ok, raw_catalog} end)

    flat_catalog = %FlatCatalog{
      checks: [
        %FlatCheck{
          description: "description 1",
          group: "Group 1",
          id: "1",
          implementation: "implementation 1",
          labels: "labels",
          name: "test 1",
          provider: :azure,
          remediation: "remediation 1"
        },
        %FlatCheck{
          description: "description 2",
          group: "Group 1",
          id: "2",
          implementation: "implementation 2",
          labels: "labels",
          name: "test 2",
          provider: :azure,
          remediation: "remediation 2"
        },
        %FlatCheck{
          description: "description 3",
          group: "Group 2",
          id: "3",
          implementation: "implementation 3",
          labels: "labels",
          name: "test 3",
          provider: :azure,
          remediation: "remediation 3"
        },
        %FlatCheck{
          description: "description 4",
          group: "Group 2",
          id: "4",
          implementation: "implementation 4",
          labels: "labels",
          name: "test 4",
          provider: :azure,
          remediation: "remediation 4"
        },
        %FlatCheck{
          description: "description 5",
          group: "Group 3",
          id: "5",
          implementation: "implementation 5",
          labels: "labels",
          name: "test 5",
          provider: :azure,
          remediation: "remediation 5"
        },
        %FlatCheck{
          description: "description 1",
          group: "Group 1",
          id: "1",
          implementation: "implementation 1",
          labels: "labels",
          name: "test 1",
          provider: :aws,
          remediation: "remediation 1"
        },
        %FlatCheck{
          description: "description 2",
          group: "Group 1",
          id: "2",
          implementation: "implementation 2",
          labels: "labels",
          name: "test 2",
          provider: :aws,
          remediation: "remediation 2"
        },
        %FlatCheck{
          description: "description 3",
          group: "Group 2",
          id: "3",
          implementation: "implementation 3",
          labels: "labels",
          name: "test 3",
          provider: :aws,
          remediation: "remediation 3"
        },
        %FlatCheck{
          description: "description 4",
          group: "Group 2",
          id: "4",
          implementation: "implementation 4",
          labels: "labels",
          name: "test 4",
          provider: :aws,
          remediation: "remediation 4"
        },
        %FlatCheck{
          description: "description 5",
          group: "Group 3",
          id: "5",
          implementation: "implementation 5",
          labels: "labels",
          name: "test 5",
          provider: :aws,
          remediation: "remediation 5"
        }
      ]
    }

    assert {:ok, flat_catalog} == Checks.get_catalog()
  end

  test "should return a catalog grouped by provider" do
    raw_catalog = load_runner_fixture("catalog")

    Trento.Integration.Checks.Mock
    |> expect(:get_catalog, fn -> {:ok, raw_catalog} end)

    catalog_by_provider = %Catalog{
      providers: [
        %Provider{
          groups: [
            %Group{
              checks: [
                %Check{
                  description: "description 1",
                  id: "1",
                  implementation: "implementation 1",
                  labels: "labels",
                  name: "test 1",
                  remediation: "remediation 1"
                },
                %Check{
                  description: "description 2",
                  id: "2",
                  implementation: "implementation 2",
                  labels: "labels",
                  name: "test 2",
                  remediation: "remediation 2"
                }
              ],
              group: "Group 1"
            },
            %Group{
              checks: [
                %Check{
                  description: "description 3",
                  id: "3",
                  implementation: "implementation 3",
                  labels: "labels",
                  name: "test 3",
                  remediation: "remediation 3"
                },
                %Check{
                  description: "description 4",
                  id: "4",
                  implementation: "implementation 4",
                  labels: "labels",
                  name: "test 4",
                  remediation: "remediation 4"
                }
              ],
              group: "Group 2"
            },
            %Group{
              checks: [
                %Check{
                  description: "description 5",
                  id: "5",
                  implementation: "implementation 5",
                  labels: "labels",
                  name: "test 5",
                  remediation: "remediation 5"
                }
              ],
              group: "Group 3"
            }
          ],
          provider: :aws
        },
        %Provider{
          groups: [
            %Group{
              checks: [
                %Check{
                  description: "description 1",
                  id: "1",
                  implementation: "implementation 1",
                  labels: "labels",
                  name: "test 1",
                  remediation: "remediation 1"
                },
                %Check{
                  description: "description 2",
                  id: "2",
                  implementation: "implementation 2",
                  labels: "labels",
                  name: "test 2",
                  remediation: "remediation 2"
                }
              ],
              group: "Group 1"
            },
            %Group{
              checks: [
                %Check{
                  description: "description 3",
                  id: "3",
                  implementation: "implementation 3",
                  labels: "labels",
                  name: "test 3",
                  remediation: "remediation 3"
                },
                %Check{
                  description: "description 4",
                  id: "4",
                  implementation: "implementation 4",
                  labels: "labels",
                  name: "test 4",
                  remediation: "remediation 4"
                }
              ],
              group: "Group 2"
            },
            %Group{
              checks: [
                %Check{
                  description: "description 5",
                  id: "5",
                  implementation: "implementation 5",
                  labels: "labels",
                  name: "test 5",
                  remediation: "remediation 5"
                }
              ],
              group: "Group 3"
            }
          ],
          provider: :azure
        }
      ]
    }

    assert {:ok, catalog_by_provider} == Checks.get_catalog_by_provider()
  end
end
