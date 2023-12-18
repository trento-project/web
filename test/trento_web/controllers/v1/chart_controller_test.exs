defmodule TrentoWeb.V1.ChartControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  describe "host memory chart" do
    setup do
      %{
        prometheus_chart_agent_id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4",
        from: DateTime.from_unix!(1_702_316_008) |> DateTime.to_iso8601(),
        to: DateTime.from_unix!(1_702_316_102) |> DateTime.to_iso8601(),
        api_spec: ApiSpec.spec()
      }
    end

    test "should return 422 when the input request timestamps are not valid", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      api_spec: api_spec,
      conn: conn
    } do
      to = 1_702_316_102
      from = 1_702_316_008

      conn
      |> get("/api/v1/charts/hosts/#{prometheus_chart_agent_id}/memory?from=#{from}&to=#{to}")
      |> json_response(422)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should return 200 with host memory chart data when host exists", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to,
      api_spec: api_spec,
      conn: conn
    } do
      insert(:host, id: prometheus_chart_agent_id)

      conn
      |> get("/api/v1/charts/hosts/#{prometheus_chart_agent_id}/memory?from=#{from}&to=#{to}")
      |> json_response(200)
      |> assert_schema("HostMemoryChart", api_spec)
    end

    test "should return 404 if a cpu chart is requested for a non existing host", %{
      from: from,
      to: to,
      api_spec: api_spec,
      conn: conn
    } do
      conn
      |> get("/api/v1/charts/hosts/#{Faker.UUID.v4()}/memory?from=#{from}&to=#{to}")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end
  end

  describe "cpu host chart" do
    setup do
      %{
        prometheus_chart_agent_id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4",
        from: DateTime.from_unix!(1_702_316_008) |> DateTime.to_iso8601(),
        to: DateTime.from_unix!(1_702_316_102) |> DateTime.to_iso8601(),
        api_spec: ApiSpec.spec()
      }
    end

    test "should return 422 when the input request timestamps are not valid", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      api_spec: api_spec,
      conn: conn
    } do
      to = 1_702_316_102
      from = 1_702_316_008

      conn
      |> get("/api/v1/charts/hosts/#{prometheus_chart_agent_id}/cpu?from=#{from}&to=#{to}")
      |> json_response(422)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should return 200 with host cpu chart data when host exists", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to,
      api_spec: api_spec,
      conn: conn
    } do
      insert(:host, id: prometheus_chart_agent_id)

      conn
      |> get("/api/v1/charts/hosts/#{prometheus_chart_agent_id}/cpu?from=#{from}&to=#{to}")
      |> json_response(200)
      |> assert_schema("HostCpuChart", api_spec)
    end

    test "should return 404 if a cpu chart is requested for a non existing host", %{
      from: from,
      to: to,
      api_spec: api_spec,
      conn: conn
    } do
      conn
      |> get("/api/v1/charts/hosts/#{Faker.UUID.v4()}/cpu?from=#{from}&to=#{to}")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end
  end
end
