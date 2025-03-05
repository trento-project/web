defmodule Trento.Settings.AnalyticsSettings do
    @moduledoc """
    Settings related to analytics.
    """

    use Ecto.Schema
    use Trento.Support.Ecto.STI, sti_identifier: :installation_settings

    import Ecto.Changeset

    @type t :: %__MODULE__{}

    @primary_key {:id, :binary_id, autogenerate: true}
    schema "settings" do
        field :analytics_optin, :boolean
        sti_fields()
    end

    @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
    def changeset(analytics_settings, attrs) do
        analytics_settings
        |> cast(attrs, [:analytics_optin])
        |> sti_changes()
    end

end