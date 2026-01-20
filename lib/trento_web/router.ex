defmodule TrentoWeb.Router do
  use TrentoWeb, :router
  use Pow.Phoenix.Router
  use PowAssent.Phoenix.Router

  require Trento.Operations.Enums.ClusterOperations, as: ClusterOperations
  require Trento.Operations.Enums.ClusterHostOperations, as: ClusterHostOperations
  require Trento.Operations.Enums.DatabaseOperations, as: DatabaseOperations
  require Trento.Operations.Enums.HostOperations, as: HostOperations
  require Trento.Operations.Enums.SapInstanceOperations, as: SapInstanceOperations
  require Trento.Operations.Enums.SapSystemOperations, as: SapSystemOperations

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

  pipeline :unversioned_api do
    plug :api
    plug OpenApiSpex.Plug.PutApiSpec, module: TrentoWeb.OpenApi.Unversioned.ApiSpec
  end

  pipeline :api_all do
    plug :api
    plug OpenApiSpex.Plug.PutApiSpec, module: TrentoWeb.OpenApi.All.ApiSpec
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
      path: "/api/all/openapi",
      urls: [
        %{url: "/api/all/openapi", name: "All"},
        %{url: "/api/v1/openapi", name: "Version 1"},
        %{url: "/api/v2/openapi", name: "Version 2"},
        %{url: "/api/unversioned/openapi", name: "Unversioned"}
      ]
  end

  scope "/api", TrentoWeb do
    pipe_through [:api]

    post "/session", SessionController, :create, as: :login
    post "/session/refresh", SessionController, :refresh, as: :refresh
    post "/session/:provider/callback", SessionController, :callback
    get "/session/:provider/saml_callback", SessionController, :saml_callback
    post "/session/token/introspect", SessionController, :introspect_token
  end

  scope "/api", TrentoWeb do
    pipe_through :api
    get "/healthz", HealthController, :health
    get "/readyz", HealthController, :ready
  end

  scope "/api", TrentoWeb.V1 do
    pipe_through [:api, :unversioned_api]
    get "/public_keys", SettingsController, :get_public_keys
  end

  scope "/api" do
    pipe_through [:api, :protected_api]

    scope "/v1", TrentoWeb.V1 do
      pipe_through [:api_v1]

      get "/about", AboutController, :info

      get "/activity_log", ActivityLogController, :get_activity_log

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

      delete "/hosts/:id", HostController, :delete

      post "/hosts/:id/tags", TagsController, :add_tag_to_host,
        assigns: %{resource_type: :host},
        as: :hosts_tagging

      delete "/hosts/:id/tags/:value", TagsController, :remove_tag_from_host,
        assigns: %{resource_type: :host},
        as: :hosts_tagging

      get "/hosts/:id/exporters_status", PrometheusController, :exporters_status

      get "/hosts/:id/software_updates", SUSEManagerController, :software_updates

      get "/software_updates/packages", SUSEManagerController, :patches_for_packages

      get "/software_updates/errata_details/:advisory_name",
          SUSEManagerController,
          :errata_details

      post "/clusters/:id/tags", TagsController, :add_tag_to_cluster,
        assigns: %{resource_type: :cluster},
        as: :clusters_tagging

      delete "/clusters/:id/tags/:value", TagsController, :remove_tag_from_cluster,
        assigns: %{resource_type: :cluster},
        as: :clusters_tagging

      post "/sap_systems/:id/tags", TagsController, :add_tag_to_sap_system,
        assigns: %{resource_type: :sap_system},
        as: :sap_systems_tagging

      delete "/sap_systems/:id/tags/:value", TagsController, :remove_tag_from_sap_system,
        assigns: %{resource_type: :sap_system},
        as: :sap_systems_tagging

      delete "/sap_systems/:id/hosts/:host_id/instances/:instance_number",
             SapSystemController,
             :delete_application_instance

      post "/databases/:id/tags", TagsController, :add_tag_to_database,
        assigns: %{resource_type: :database},
        as: :databases_tagging

      delete "/databases/:id/tags/:value", TagsController, :remove_tag_from_database,
        assigns: %{resource_type: :database},
        as: :databases_tagging

      delete "/databases/:id/hosts/:host_id/instances/:instance_number",
             DatabaseController,
             :delete_database_instance

      if Application.compile_env!(:trento, :operations_enabled) do
        # The operation endpoints are created using the operation Enums.
        # Every entry has a new path in the router
        for host_operation <- HostOperations.values() do
          post "/hosts/:id/operations/#{host_operation}", HostController, host_operation
        end

        for cluster_operation <- ClusterOperations.values() do
          post "/clusters/:id/operations/#{cluster_operation}",
               ClusterController,
               cluster_operation
        end

        for sap_system_operation <- SapSystemOperations.values() do
          post "/sap_systems/:id/operations/#{sap_system_operation}",
               SapSystemController,
               sap_system_operation
        end

        for database_operations <- DatabaseOperations.values() do
          post "/databases/:id/operations/#{database_operations}",
               DatabaseController,
               database_operations
        end

        for cluster_host_operation <- ClusterHostOperations.values() do
          post "/clusters/:id/hosts/:host_id/operations/#{cluster_host_operation}",
               ClusterController,
               cluster_host_operation
        end

        for sap_instance_operation <- SapInstanceOperations.values() do
          post "/sap_systems/:id/hosts/:host_id/instances/:instance_number/operations/#{sap_instance_operation}",
               SapSystemController,
               sap_instance_operation
        end
      end

      resources "/users", UsersController, except: [:new, :edit, :update]
      patch "/users/:id", UsersController, :patch
      put "/users/:id", UsersController, :put
      delete "/users/:id/tokens/:token_id", UsersController, :revoke_personal_access_token

      scope "/profile" do
        get "/", ProfileController, :show
        patch "/", ProfileController, :update
        delete "/totp_enrollment", ProfileController, :reset_totp
        get "/totp_enrollment", ProfileController, :get_totp_enrollment_data
        post "/totp_enrollment", ProfileController, :confirm_totp_enrollment

        scope "/tokens" do
          post "/", PersonalAccessTokensController, :create_personal_access_token
          delete "/:token_id", PersonalAccessTokensController, :revoke_personal_access_token
        end
      end

      get "/abilities", AbilityController, :index

      scope "/settings" do
        get "/api_key", SettingsController, :get_api_key_settings
        patch "/api_key", SettingsController, :update_api_key_settings

        # Activity Log Settings
        put "/activity_log", SettingsController, :update_activity_log_settings
        get "/activity_log", SettingsController, :get_activity_log_settings

        scope "/suse_manager" do
          get "/", SettingsController, :get_suse_manager_settings
          post "/", SettingsController, :save_suse_manager_settings
          patch "/", SettingsController, :patch_suse_manager_settings
          put "/", SettingsController, :put_suse_manager_settings
          delete "/", SettingsController, :delete_suse_manager_settings
          post "/test", SettingsController, :test_suse_manager_settings
        end

        scope "/alerting" do
          get "/", SettingsController, :get_alerting_settings
          post "/", SettingsController, :create_alerting_settings
          patch "/", SettingsController, :update_alerting_settings
        end
      end

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

    scope "/unversioned" do
      pipe_through :unversioned_api
      get "/openapi", OpenApiSpex.Plug.RenderSpec, []
    end

    scope "/all" do
      pipe_through :api_all
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
