defmodule TrentoWeb.CatalogControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Mox

  @runner_fixtures_path File.cwd!() <> "/test/fixtures/runner"

  def load_runner_fixture(name) do
    @runner_fixtures_path
    |> Path.join("#{name}.json")
    |> File.read!()
    |> Jason.decode!()
  end

  test "should return a catalog grouped by providers", %{conn: conn} do
    raw_catalog = load_runner_fixture("catalog")

    Trento.Integration.Checks.Mock
    |> expect(:get_catalog, fn -> {:ok, raw_catalog} end)

    conn = get(conn, Routes.catalog_path(conn, :checks_catalog))

    expected_json = [
      %{
        "groups" => [
          %{
            "checks" => [
              %{
                "description" => "description 1",
                "id" => "1",
                "implementation" => "implementation 1",
                "labels" => "labels",
                "name" => "test 1",
                "remediation" => "remediation 1"
              },
              %{
                "description" => "description 2",
                "id" => "2",
                "implementation" => "implementation 2",
                "labels" => "labels",
                "name" => "test 2",
                "remediation" => "remediation 2"
              }
            ],
            "group" => "Group 1"
          },
          %{
            "checks" => [
              %{
                "description" => "description 3",
                "id" => "3",
                "implementation" => "implementation 3",
                "labels" => "labels",
                "name" => "test 3",
                "remediation" => "remediation 3"
              },
              %{
                "description" => "description 4",
                "id" => "4",
                "implementation" => "implementation 4",
                "labels" => "labels",
                "name" => "test 4",
                "remediation" => "remediation 4"
              }
            ],
            "group" => "Group 2"
          },
          %{
            "checks" => [
              %{
                "description" => "description 5",
                "id" => "5",
                "implementation" => "implementation 5",
                "labels" => "labels",
                "name" => "test 5",
                "remediation" => "remediation 5"
              }
            ],
            "group" => "Group 3"
          }
        ],
        "provider" => "aws"
      },
      %{
        "groups" => [
          %{
            "checks" => [
              %{
                "description" => "description 1",
                "id" => "1",
                "implementation" => "implementation 1",
                "labels" => "labels",
                "name" => "test 1",
                "remediation" => "remediation 1"
              },
              %{
                "description" => "description 2",
                "id" => "2",
                "implementation" => "implementation 2",
                "labels" => "labels",
                "name" => "test 2",
                "remediation" => "remediation 2"
              }
            ],
            "group" => "Group 1"
          },
          %{
            "checks" => [
              %{
                "description" => "description 3",
                "id" => "3",
                "implementation" => "implementation 3",
                "labels" => "labels",
                "name" => "test 3",
                "remediation" => "remediation 3"
              },
              %{
                "description" => "description 4",
                "id" => "4",
                "implementation" => "implementation 4",
                "labels" => "labels",
                "name" => "test 4",
                "remediation" => "remediation 4"
              }
            ],
            "group" => "Group 2"
          },
          %{
            "checks" => [
              %{
                "description" => "description 5",
                "id" => "5",
                "implementation" => "implementation 5",
                "labels" => "labels",
                "name" => "test 5",
                "remediation" => "remediation 5"
              }
            ],
            "group" => "Group 3"
          }
        ],
        "provider" => "azure"
      }
    ]

    assert expected_json == json_response(conn, 200)
  end

  test "should return a flat catalog", %{conn: conn} do
    raw_catalog = load_runner_fixture("catalog")

    Trento.Integration.Checks.Mock
    |> expect(:get_catalog, fn -> {:ok, raw_catalog} end)

    conn =
      get(conn, Routes.catalog_path(conn, :checks_catalog), %{
        "flat" => ""
      })

    expected_json = [
      %{
        "provider" => "azure",
        "description" => "description 1",
        "group" => "Group 1",
        "id" => "1",
        "implementation" => "implementation 1",
        "labels" => "labels",
        "name" => "test 1",
        "remediation" => "remediation 1"
      },
      %{
        "provider" => "azure",
        "description" => "description 2",
        "group" => "Group 1",
        "id" => "2",
        "implementation" => "implementation 2",
        "labels" => "labels",
        "name" => "test 2",
        "remediation" => "remediation 2"
      },
      %{
        "description" => "description 3",
        "group" => "Group 2",
        "id" => "3",
        "implementation" => "implementation 3",
        "labels" => "labels",
        "name" => "test 3",
        "provider" => "azure",
        "remediation" => "remediation 3"
      },
      %{
        "description" => "description 4",
        "group" => "Group 2",
        "id" => "4",
        "implementation" => "implementation 4",
        "labels" => "labels",
        "name" => "test 4",
        "provider" => "azure",
        "remediation" => "remediation 4"
      },
      %{
        "description" => "description 5",
        "group" => "Group 3",
        "id" => "5",
        "implementation" => "implementation 5",
        "labels" => "labels",
        "name" => "test 5",
        "provider" => "azure",
        "remediation" => "remediation 5"
      },
      %{
        "description" => "description 1",
        "group" => "Group 1",
        "id" => "1",
        "implementation" => "implementation 1",
        "labels" => "labels",
        "name" => "test 1",
        "provider" => "aws",
        "remediation" => "remediation 1"
      },
      %{
        "description" => "description 2",
        "group" => "Group 1",
        "id" => "2",
        "implementation" => "implementation 2",
        "labels" => "labels",
        "name" => "test 2",
        "provider" => "aws",
        "remediation" => "remediation 2"
      },
      %{
        "description" => "description 3",
        "group" => "Group 2",
        "id" => "3",
        "implementation" => "implementation 3",
        "labels" => "labels",
        "name" => "test 3",
        "provider" => "aws",
        "remediation" => "remediation 3"
      },
      %{
        "description" => "description 4",
        "group" => "Group 2",
        "id" => "4",
        "implementation" => "implementation 4",
        "labels" => "labels",
        "name" => "test 4",
        "provider" => "aws",
        "remediation" => "remediation 4"
      },
      %{
        "description" => "description 5",
        "group" => "Group 3",
        "id" => "5",
        "implementation" => "implementation 5",
        "labels" => "labels",
        "name" => "test 5",
        "provider" => "aws",
        "remediation" => "remediation 5"
      }
    ]

    assert expected_json == json_response(conn, 200)
  end
end
