defmodule TrentoWeb.Router do
  use TrentoWeb, :router
  use Pow.Phoenix.Router

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
  end

  pipeline :protected do
    plug Pow.Plug.RequireAuthenticated,
      error_handler: Pow.Phoenix.PlugErrorHandler
  end

  scope "/" do
    pipe_through :browser

    pow_session_routes()
  end

  scope "/feature-flags" do
    pipe_through :browser
    forward "/", FunWithFlags.UI.Router, namespace: "feature-flags"
  end

  scope "/api", TrentoWeb do
    pipe_through :api

    post "/collect", DiscoveryController, :collect

    get "/about", AboutController, :info

    get "/hosts", HostController, :list
    post "/hosts/:id/heartbeat", HostController, :heartbeat
    post "/hosts/:id/tags", HostController, :create_tag
    delete "/hosts/:id/tags/:value", HostController, :delete_tag

    get "/clusters", ClusterController, :list
    post "/clusters/:id/tags", ClusterController, :create_tag
    delete "/clusters/:id/tags/:value", ClusterController, :delete_tag

    get "/sap_systems", SapSystemController, :list
    post "/sap_systems/:id/tags", SapSystemController, :create_tag
    delete "/sap_systems/:id/tags/:value", SapSystemController, :delete_tag
    get "/databases", SapSystemController, :list_databases

    post "/clusters/:cluster_id/checks", ClusterController, :select_checks

    post "/clusters/:cluster_id/checks/request_execution",
         ClusterController,
         :request_checks_execution

    post "/runner/callback", ClusterController, :runner_callback
    get "/checks/catalog", CatalogController, :checks_catalog
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

  # Enables the Swoosh mailbox preview in development.
  #
  # Note that preview only shows emails that were sent by the same
  # node running the Phoenix server.
  if Mix.env() == :dev do
    scope "/dev" do
      pipe_through :browser

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  scope "/*path", TrentoWeb do
    pipe_through [:browser, :protected]

    get "/", PageController, :index
  end
end
