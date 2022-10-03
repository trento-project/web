defmodule Trento.Integration.Discovery.ClusterDiscoveryPayload.Sbd do
  @moduledoc """
  SBD field payload
  """
  alias Trento.Support.ListHelper

  @required_fields []
  use Trento.Type

  deftype do
    field :config, :map

    embeds_many :devices, Device do
      field :device, :string
      field :status, :string
    end
  end

  def changeset(sbd, attrs) do
    transformed_attrs = transform_nil_lists(attrs)

    sbd
    |> cast(transformed_attrs, [:config])
    |> cast_embed(:devices, with: &devices_changeset/2)
    |> validate_required_fields(@required_fields)
  end

  defp devices_changeset(devices, attrs) do
    devices
    |> cast(attrs, [:device, :status])
    |> validate_required_fields([:device, :status])
  end

  defp transform_nil_lists(%{"devices" => devices} = attrs) do
    Map.put(attrs, "devices", ListHelper.to_list(devices))
  end
end
