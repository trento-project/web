defmodule Trento.Integration.ChecksTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox
  # TODO: Remove Mock usage
  import Mock

  alias Trento.Integration.Checks

  alias Trento.Integration.Checks.{
    CatalogDto,
    CheckDto,
    FlatCatalogDto,
    FlatCheckDto,
    GroupDto,
    ProviderDto
  }

  alias Trento.Domain.Commands.{
    CompleteChecksExecution,
    StartChecksExecution
  }

  alias Trento.Domain.{
    CheckResult,
    HostExecution
  }

  @runner_fixtures_path File.cwd!() <> "/test/fixtures/runner"

  def load_runner_fixture(name) do
    @runner_fixtures_path
    |> Path.join("#{name}.json")
    |> File.read!()
    |> Jason.decode!()
  end

  @moduletag :integration

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

    assert {:error, :not_ready} = Checks.get_catalog()
  end

  test "should return a flat catalog" do
    raw_catalog = load_runner_fixture("catalog")

    Trento.Integration.Checks.Mock
    |> expect(:get_catalog, fn -> FlatCatalogDto.new(%{checks: raw_catalog}) end)

    flat_catalog = %FlatCatalogDto{
      checks: [
        %FlatCheckDto{
          description: "description 1",
          group: "Group 1",
          id: "1",
          implementation: "implementation 1",
          labels: "labels",
          name: "test 1",
          provider: :azure,
          remediation: "remediation 1"
        },
        %FlatCheckDto{
          description: "description 2",
          group: "Group 1",
          id: "2",
          implementation: "implementation 2",
          labels: "labels",
          name: "test 2",
          provider: :azure,
          remediation: "remediation 2"
        },
        %FlatCheckDto{
          description: "description 3",
          group: "Group 2",
          id: "3",
          implementation: "implementation 3",
          labels: "labels",
          name: "test 3",
          provider: :azure,
          remediation: "remediation 3"
        },
        %FlatCheckDto{
          description: "description 4",
          group: "Group 2",
          id: "4",
          implementation: "implementation 4",
          labels: "labels",
          name: "test 4",
          provider: :azure,
          remediation: "remediation 4"
        },
        %FlatCheckDto{
          description: "description 5",
          group: "Group 3",
          id: "5",
          implementation: "implementation 5",
          labels: "labels",
          name: "test 5",
          provider: :azure,
          remediation: "remediation 5"
        },
        %FlatCheckDto{
          description: "description 1",
          group: "Group 1",
          id: "1",
          implementation: "implementation 1",
          labels: "labels",
          name: "test 1",
          provider: :aws,
          remediation: "remediation 1"
        },
        %FlatCheckDto{
          description: "description 2",
          group: "Group 1",
          id: "2",
          implementation: "implementation 2",
          labels: "labels",
          name: "test 2",
          provider: :aws,
          remediation: "remediation 2"
        },
        %FlatCheckDto{
          description: "description 3",
          group: "Group 2",
          id: "3",
          implementation: "implementation 3",
          labels: "labels",
          name: "test 3",
          provider: :aws,
          remediation: "remediation 3"
        },
        %FlatCheckDto{
          description: "description 4",
          group: "Group 2",
          id: "4",
          implementation: "implementation 4",
          labels: "labels",
          name: "test 4",
          provider: :aws,
          remediation: "remediation 4"
        },
        %FlatCheckDto{
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
    |> expect(:get_catalog, fn -> FlatCatalogDto.new(%{checks: raw_catalog}) end)

    catalog_by_provider = %CatalogDto{
      providers: [
        %ProviderDto{
          groups: [
            %GroupDto{
              checks: [
                %CheckDto{
                  description: "description 1",
                  id: "1",
                  implementation: "implementation 1",
                  labels: "labels",
                  name: "test 1",
                  remediation: "remediation 1"
                },
                %CheckDto{
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
            %GroupDto{
              checks: [
                %CheckDto{
                  description: "description 3",
                  id: "3",
                  implementation: "implementation 3",
                  labels: "labels",
                  name: "test 3",
                  remediation: "remediation 3"
                },
                %CheckDto{
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
            %GroupDto{
              checks: [
                %CheckDto{
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
        %ProviderDto{
          groups: [
            %GroupDto{
              checks: [
                %CheckDto{
                  description: "description 1",
                  id: "1",
                  implementation: "implementation 1",
                  labels: "labels",
                  name: "test 1",
                  remediation: "remediation 1"
                },
                %CheckDto{
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
            %GroupDto{
              checks: [
                %CheckDto{
                  description: "description 3",
                  id: "3",
                  implementation: "implementation 3",
                  labels: "labels",
                  name: "test 3",
                  remediation: "remediation 3"
                },
                %CheckDto{
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
            %GroupDto{
              checks: [
                %CheckDto{
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

    assert {:ok, catalog_by_provider} == Checks.get_catalog_grouped_by_provider()
  end

  test "should handle execution started event properly" do
    with_mock Trento.Commanded, dispatch: fn _, _ -> :ok end do
      execution_id = Faker.UUID.v4()
      cluster_id = Faker.UUID.v4()

      Checks.handle_callback(%{
        "event" => "execution_started",
        "execution_id" => execution_id,
        "payload" => %{
          "cluster_id" => cluster_id
        }
      })

      assert_called Trento.Commanded.dispatch(
                      %StartChecksExecution{
                        cluster_id: cluster_id
                      },
                      correlation_id: execution_id
                    )
    end
  end

  test "should handle execution completed event properly" do
    with_mock Trento.Commanded, dispatch: fn _, _ -> :ok end do
      execution_id = Faker.UUID.v4()
      cluster_id = Faker.UUID.v4()
      host_id_1 = Faker.UUID.v4()
      host_id_2 = Faker.UUID.v4()

      Checks.handle_callback(%{
        "event" => "execution_completed",
        "execution_id" => execution_id,
        "payload" => %{
          "cluster_id" => cluster_id,
          "hosts" => [
            %{
              "host_id" => host_id_1,
              "reachable" => true,
              "msg" => "",
              "results" => [
                %{
                  "check_id" => "check1",
                  "result" => "passing"
                },
                %{
                  "check_id" => "check2",
                  "result" => "warning"
                }
              ]
            },
            %{
              "host_id" => host_id_2,
              "reachable" => true,
              "msg" => "",
              "results" => [
                %{
                  "check_id" => "check1",
                  "result" => "critical"
                },
                %{
                  "check_id" => "check2",
                  "result" => "warning"
                }
              ]
            }
          ]
        }
      })

      assert_called Trento.Commanded.dispatch(
                      %CompleteChecksExecution{
                        cluster_id: cluster_id,
                        hosts_executions: [
                          %HostExecution{
                            checks_results: [
                              %CheckResult{
                                check_id: "check1",
                                result: :passing
                              },
                              %CheckResult{
                                check_id: "check2",
                                result: :warning
                              }
                            ],
                            host_id: host_id_1,
                            msg: nil,
                            reachable: true
                          },
                          %HostExecution{
                            checks_results: [
                              %CheckResult{
                                check_id: "check1",
                                result: :critical
                              },
                              %CheckResult{
                                check_id: "check2",
                                result: :warning
                              }
                            ],
                            host_id: host_id_2,
                            msg: nil,
                            reachable: true
                          }
                        ]
                      },
                      correlation_id: execution_id
                    )
    end
  end
end
