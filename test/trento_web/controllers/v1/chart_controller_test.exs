defmodule TrentoWeb.V1.ChartControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Mox

  import OpenApiSpex.TestAssertions
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  defp prepare_iso_date(timestamp) do
    timestamp
    |> DateTime.from_unix!()
    |> DateTime.to_iso8601()
  end

  defp setup_time_series_chart(_) do
    %{
      prometheus_chart_agent_id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4",
      from: prepare_iso_date(1_702_316_008),
      to: prepare_iso_date(1_702_316_102)
    }
  end

  defp setup_api_spec(_), do: %{api_spec: ApiSpec.spec()}

  describe "host memory chart" do
    setup :setup_api_spec
    setup :setup_time_series_chart

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
      |> assert_schema("UnprocessableEntityV1", api_spec)
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
      |> assert_schema("HostMemoryChartV1", api_spec)
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
      |> assert_schema("NotFoundV1", api_spec)
    end
  end

  describe "cpu host chart" do
    setup :setup_api_spec
    setup :setup_time_series_chart

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
      |> assert_schema("UnprocessableEntityV1", api_spec)
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
      |> assert_schema("HostCpuChartV1", api_spec)
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
      |> assert_schema("NotFoundV1", api_spec)
    end
  end

  describe "filesystem chart" do
    setup :setup_api_spec

    setup do
      expect(Trento.Support.DateService.Mock, :utc_now, fn _ ->
        DateTime.from_unix!(1_773_388_980)
      end)

      Application.put_env(:trento, Trento.Support.DateService, Trento.Support.DateService.Mock)

      on_exit(fn -> Application.put_env(:trento, Trento.Support.DateService, DateTime) end)

      host_id = "f7a8969b-db9e-4162-b82a-d5cfafe1c4e9"

      insert(:host, id: host_id)

      %{
        prometheus_chart_agent_id: host_id
      }
    end

    test "should return 404 if a filesystem chart is requested for a non existing host: without time",
         %{
           api_spec: api_spec,
           conn: conn
         } do
      conn
      |> get("/api/v1/charts/hosts/#{Faker.UUID.v4()}/filesystem")
      |> json_response(404)
      |> assert_schema("NotFoundV1", api_spec)
    end

    test "should return 404 if a filesystem chart is requested for a non existing host: with time",
         %{
           api_spec: api_spec,
           conn: conn
         } do
      conn
      |> get(
        "/api/v1/charts/hosts/#{Faker.UUID.v4()}/filesystem?time=#{prepare_iso_date(1_702_316_102)}"
      )
      |> json_response(404)
      |> assert_schema("NotFoundV1", api_spec)
    end

    test "should return 422 when the input request time is not valid", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      api_spec: api_spec,
      conn: conn
    } do
      invalid_time_format = 1_702_316_008

      conn
      |> get(
        "/api/v1/charts/hosts/#{prometheus_chart_agent_id}/filesystem?time=#{invalid_time_format}"
      )
      |> json_response(422)
      |> assert_schema("UnprocessableEntityV1", api_spec)
    end

    test "should return 200 with host filesystem chart data when host exists: without time", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      api_spec: api_spec,
      conn: conn
    } do
      conn
      |> get("/api/v1/charts/hosts/#{prometheus_chart_agent_id}/filesystem")
      |> json_response(200)
      |> assert_schema("HostFilesystemChartV1", api_spec)
    end

    test "should return 200 with host filesystem chart data when host exists: with time", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      api_spec: api_spec,
      conn: conn
    } do
      conn
      |> get(
        "/api/v1/charts/hosts/#{prometheus_chart_agent_id}/filesystem?time=#{prepare_iso_date(1_773_388_980)}"
      )
      |> json_response(200)
      |> assert_schema("HostFilesystemChartV1", api_spec)
    end
  end
end
