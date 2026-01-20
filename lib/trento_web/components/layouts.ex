defmodule TrentoWeb.Layouts do
  @moduledoc """
  This module holds different layouts used by your application.

  See the `layouts` directory for all templates available.
  The "root" layout is a skeleton rendered as part of the
  application router. The "app" layout is set as the default
  layout on both `use TrentoWeb, :controller` and
  `use TrentoWeb, :live_view`.
  """
  use TrentoWeb, :html

  embed_templates "layouts/*"
  @compile {:no_warn_undefined, {Routes, :live_dashboard_path, 2}}

  # next functionare  used in `root.html.heex` to interpolate values
  def get_gtm_id do
    Application.fetch_env!(:trento, :analytics)[:gtm_id]
  end

  def analytics_enabled? do
    Application.fetch_env!(:trento, :analytics)[:enabled]
  end
end
