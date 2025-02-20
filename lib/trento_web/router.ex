defmodule TrentoWeb.Router do
  use TrentoWeb, :router
  use Pow.Phoenix.Router
  use PowAssent.Phoenix.Router

  # From newest to oldest
  @available_api_versions ["v2", "v1"]

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {TrentoWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug TrentoWeb.Plugs.AppJWTAuthPlug, otp_app: :trento
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
      do: {Pow.Plug.RequireAuthenticated, error_handler: TrentoWeb.Plugs.ApiAuthErrorHandler}
  end

  pipeline :apikey_authenticated do
    plug Unplug,
      if: {Unplug.Predicates.AppConfigEquals, {:trento, :api_key_authentication_enabled, true}},
      do:
        {TrentoWeb.Plugs.AuthenticateAPIKeyPlug,
         error_handler: TrentoWeb.Plugs.ApiAuthErrorHandler}
  end

  pipeline :charts_feature do
    plug Unplug,
      if: TrentoWeb.Plugs.Unplug.Predicates.ChartsDisabled,
      do: TrentoWeb.Plugs.ChartsDisabledPlug
  end

  scope "/sso" do
    forward "/", Samly.Router
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
    post "/session/:provider/callback", SessionController, :callback
    get "/session/:provider/saml_callback", SessionController, :saml_callback
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

  scope "/api", TrentoWeb.V1 do
    pipe_through [:api, :api_v1]
    get "/public_keys", SettingsController, :get_public_keys
  end

  scope "/api" do
    pipe_through [:api, :protected_api]

    get "/me", TrentoWeb.SessionController, :show, as: :me

    scope "/v1", TrentoWeb.V1 do
      pipe_through [:api_v1]

      get "/about", AboutController, :info

      get "/activity_log", ActivityLogController, :get_activity_log

      get "/installation/api-key", InstallationController, :get_api_key

      get "/hosts", HostController, :list
      get "/clusters", ClusterController, :list
      get "/sap_systems", SapSystemController, :list
      get "/sap_systems/health", HealthOverviewController, :overview
      get "/databases", DatabaseController, :list_databases

      post "/clusters/:cluster_id/checks", ClusterController, :select_checks
      post "/hosts/:id/checks", HostController, :select_checks

      post "/clusters/:cluster_id/checks/request_execution",
           ClusterController,
           :request_checks_execution

      post "/hosts/:id/checks/request_execution",
           HostController,
           :request_checks_execution

      post "/hosts/:id/tags", TagsController, :add_tag,
        assigns: %{resource_type: :host},
        as: :hosts_tagging

      delete "/hosts/:id", HostController, :delete

      delete "/hosts/:id/tags/:value", TagsController, :remove_tag,
        assigns: %{resource_type: :host},
        as: :hosts_tagging

      get "/hosts/:id/exporters_status", PrometheusController, :exporters_status

      get "/hosts/:id/software_updates", SUSEManagerController, :software_updates

      get "/software_updates/packages", SUSEManagerController, :patches_for_packages

      get "/software_updates/errata_details/:advisory_name",
          SUSEManagerController,
          :errata_details

      post "/clusters/:id/tags", TagsController, :add_tag,
        assigns: %{resource_type: :cluster},
        as: :clusters_tagging

      delete "/clusters/:id/tags/:value", TagsController, :remove_tag,
        assigns: %{resource_type: :cluster},
        as: :clusters_tagging

      post "/sap_systems/:id/tags", TagsController, :add_tag,
        assigns: %{resource_type: :sap_system},
        as: :sap_systems_tagging

      delete "/sap_systems/:id/tags/:value", TagsController, :remove_tag,
        assigns: %{resource_type: :sap_system},
        as: :sap_systems_tagging

      delete "/sap_systems/:id/hosts/:host_id/instances/:instance_number",
             SapSystemController,
             :delete_application_instance

      post "/databases/:id/tags", TagsController, :add_tag,
        assigns: %{resource_type: :database},
        as: :databases_tagging

      delete "/databases/:id/tags/:value", TagsController, :remove_tag,
        assigns: %{resource_type: :database},
        as: :databases_tagging

      delete "/databases/:id/hosts/:host_id/instances/:instance_number",
             DatabaseController,
             :delete_database_instance

      if Application.compile_env!(:trento, :operations_enabled) do
        post "/hosts/:id/operations/:operation", HostController, :request_operation
      end

      resources "/users", UsersController, except: [:new, :edit]

      get "/profile", ProfileController, :show
      patch "/profile", ProfileController, :update
      delete "/profile/totp_enrollment", ProfileController, :reset_totp
      get "/profile/totp_enrollment", ProfileController, :get_totp_enrollment_data
      post "/profile/totp_enrollment", ProfileController, :confirm_totp_enrollment

      get "/abilities", AbilityController, :index

      scope "/settings" do
        get "/", SettingsController, :settings
        post "/accept_eula", SettingsController, :accept_eula
        get "/api_key", SettingsController, :get_api_key_settings
        patch "/api_key", SettingsController, :update_api_key_settings

        # Activity Log Settings
        put "/activity_log", SettingsController, :update_activity_log_settings
        get "/activity_log", SettingsController, :get_activity_log_settings

        scope "/suse_manager" do
          get "/", SettingsController, :get_suse_manager_settings
          post "/", SettingsController, :save_suse_manager_settings
          patch "/", SettingsController, :update_suse_manager_settings
          put "/", SettingsController, :update_suse_manager_settings
          delete "/", SettingsController, :delete_suse_manager_settings
          post "/test", SettingsController, :test_suse_manager_settings
        end

        # deprecated
        scope "/suma_credentials" do
          get "/", SettingsController, :get_suse_manager_settings
          post "/", SettingsController, :save_suse_manager_settings
          patch "/", SettingsController, :update_suse_manager_settings
          put "/", SettingsController, :update_suse_manager_settings
          delete "/", SettingsController, :delete_suse_manager_settings
          post "/test", SettingsController, :test_suse_manager_settings
        end
      end

      # Deprecated
      post "/accept_eula", SettingsController, :accept_eula

      scope "/charts" do
        pipe_through :charts_feature

        get "/hosts/:id/cpu", ChartController, :host_cpu
        get "/hosts/:id/memory", ChartController, :host_memory
      end
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
        metrics: TrentoWeb.Telemetry
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
    pipe_through :browser

    get "/", PageController, :index
  end

  def available_api_versions, do: @available_api_versions
end
