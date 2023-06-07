defmodule TrentoWeb.Router do
  use TrentoWeb, :router
  use Pow.Phoenix.Router

  # From newest to oldest
  @available_api_versions ["v2", "v1"]

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {TrentoWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug TrentoWeb.Auth.JWTAuthPlug, otp_app: :trento
  end

  pipeline :api_v1 do
    plug :api
    plug OpenApiSpex.Plug.PutApiSpec, module: TrentoWeb.OpenApi.V1.ApiSpec
  end

  pipeline :api_v2 do
    plug :api
    plug OpenApiSpex.Plug.PutApiSpec, module: TrentoWeb.OpenApi.V2.ApiSpec
  end

  pipeline :protected_api do
    plug Unplug,
      if: {Unplug.Predicates.AppConfigEquals, {:trento, :jwt_authentication_enabled, true}},
      do: {Pow.Plug.RequireAuthenticated, error_handler: TrentoWeb.Auth.ApiAuthErrorHandler}
  end

  pipeline :apikey_authenticated do
    plug Unplug,
      if: {Unplug.Predicates.AppConfigEquals, {:trento, :api_key_authentication_enabled, true}},
      do:
        {Trento.Infrastructure.Auth.AuthenticateAPIKeyPlug,
         error_handler: TrentoWeb.Auth.ApiAuthErrorHandler}
  end

  scope "/" do
    pipe_through :browser

    get "/api/doc", OpenApiSpex.Plug.SwaggerUI,
      path: "/api/v1/openapi",
      urls: [
        %{url: "/api/v1/openapi", name: "Version 1"},
        %{url: "/api/v2/openapi", name: "Version 2"}
      ]
  end

  scope "/api", TrentoWeb do
    pipe_through [:api]

    post "/session", SessionController, :create, as: :login
    post "/session/refresh", SessionController, :refresh, as: :refresh
  end

  scope "/feature-flags" do
    pipe_through :browser
    forward "/", FunWithFlags.UI.Router, namespace: "feature-flags"
  end

  scope "/api", TrentoWeb do
    pipe_through :api
    get "/healthz", HealthController, :health
    get "/readyz", HealthController, :ready
  end

  scope "/api" do
    pipe_through [:api, :protected_api]

    get "/me", TrentoWeb.SessionController, :show, as: :me

    scope "/v1", TrentoWeb.V1 do
      pipe_through [:api_v1]

      get "/about", AboutController, :info

      get "/installation/api-key", InstallationController, :get_api_key

      get "/hosts", HostController, :list
      get "/clusters", ClusterController, :list
      get "/sap_systems", SapSystemController, :list
      get "/sap_systems/health", HealthOverviewController, :overview
      get "/databases", SapSystemController, :list_databases

      post "/clusters/:cluster_id/checks", ClusterController, :select_checks

      post "/clusters/:cluster_id/checks/request_execution",
           ClusterController,
           :request_checks_execution

      post "/hosts/:id/tags", TagsController, :add_tag,
        assigns: %{resource_type: :host},
        as: :hosts_tagging

      delete "/hosts/:id", HostController, :delete

      delete "/hosts/:id/tags/:value", TagsController, :remove_tag, as: :hosts_tagging

      post "/clusters/:id/tags", TagsController, :add_tag,
        assigns: %{resource_type: :cluster},
        as: :clusters_tagging

      delete "/clusters/:id/tags/:value", TagsController, :remove_tag, as: :clusters_tagging

      post "/sap_systems/:id/tags", TagsController, :add_tag,
        assigns: %{resource_type: :sap_system},
        as: :sap_systems_tagging

      delete "/sap_systems/:id/tags/:value", TagsController, :remove_tag, as: :sap_systems_tagging

      post "/databases/:id/tags", TagsController, :add_tag,
        assigns: %{resource_type: :database},
        as: :databases_tagging

      delete "/databases/:id/tags/:value", TagsController, :remove_tag, as: :databases_tagging

      get "/settings", SettingsController, :settings
      post "/accept_eula", SettingsController, :accept_eula

      get "/hosts/:id/exporters_status", PrometheusController, :exporters_status
    end

    scope "/v2", TrentoWeb.V2 do
      pipe_through [:api_v2]

      get "/clusters", ClusterController, :list
    end
  end

  scope "/api" do
    pipe_through [:api, :apikey_authenticated]

    scope "/v1", TrentoWeb.V1 do
      pipe_through [:api_v1]

      post "/collect", DiscoveryController, :collect
      post "/hosts/:id/heartbeat", HostController, :heartbeat
    end
  end

  scope "/api" do
    pipe_through :api

    scope "/v1", TrentoWeb.V1 do
      pipe_through [:api_v1]

      get "/prometheus/targets", PrometheusController, :targets
    end
  end

  scope "/api" do
    pipe_through :api

    scope "/v1" do
      pipe_through :api_v1
      get "/openapi", OpenApiSpex.Plug.RenderSpec, []
    end

    scope "/v2" do
      pipe_through :api_v2
      get "/openapi", OpenApiSpex.Plug.RenderSpec, []
    end
  end

  scope "/api" do
    pipe_through :api

    match :*, "/*path/", TrentoWeb.Plugs.ApiRedirector,
      available_api_versions: @available_api_versions,
      router: __MODULE__
  end

  # Other scopes may use custom stacks.
  # scope "/api", TrentoWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser

      live_dashboard "/dashboard",
        metrics: TrentoWeb.Telemetry,
        additional_pages: [
          eventstores: {EventStore.Dashboard, event_stores: [Trento.EventStore]}
        ]
    end
  end

  if Mix.env() == :dev do
    # Enables the Swoosh mailbox preview in development.
    #
    # Note that preview only shows emails that were sent by the same
    # node running the Phoenix server.
    scope "/dev" do
      pipe_through :browser

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  scope "/*path", TrentoWeb do
    pipe_through [:browser]

    get "/", PageController, :index
  end

  def available_api_versions, do: @available_api_versions
end
