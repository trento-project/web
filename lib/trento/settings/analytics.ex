defmodule Trento.Settings.AnalyticsSettings do
    @moduledoc """
    Settings related to analytics.
    """

    use Ecto.Schema
    use Trento.Support.Ecto.STI, sti_identifier: :installation_settings

    @primary_key {:id, :binary_id, autogenerate: true}
    schema "settings" do
        field :analytics_optin, :boolean
        sti_fields()
    end

end