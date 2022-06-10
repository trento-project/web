defmodule Trento.Integration.Discovery.ClusterDiscoveryPayload.Sbd do
  @moduledoc """
  SBD field payload
  """
  alias Trento.Support.ListHelper

  @required_fields []
  use Trento.Type

  deftype do
    embeds_one :config, SBDConfig do
      field :sbd_delay_start, :string
      field :sbd_device, :string
      field :sbd_move_to_root_cgroup, :string
      field :sbd_pacemaker, :string
      field :sbd_startmode, :string
      field :sbd_timeout_action, :string
      field :sbd_watchdog_dev, :string
      field :sbd_watchdog_timeout, :string
    end

    embeds_many :devices, Device do
      field :device, :string
      field :status, :string
    end
  end

  def changeset(sbd, attrs) do
    filtered_attrs = transform_nil_lists(attrs)

    sbd
    |> cast(filtered_attrs, [])
    |> cast_embed(:config, with: &config_changeset/2)
    |> cast_embed(:devices, with: &devices_changeset/2)
    |> validate_required_fields(@required_fields)
  end

  defp config_changeset(config, attrs) do
    config
    |> cast(attrs, [
      :sbd_delay_start,
      :sbd_device,
      :sbd_move_to_root_cgroup,
      :sbd_pacemaker,
      :sbd_startmode,
      :sbd_timeout_action,
      :sbd_watchdog_dev,
      :sbd_watchdog_timeout
    ])
    |> validate_required_fields([
      :sbd_delay_start,
      :sbd_device,
      :sbd_move_to_root_cgroup,
      :sbd_pacemaker,
      :sbd_startmode,
      :sbd_timeout_action,
      :sbd_watchdog_dev,
      :sbd_watchdog_timeout
    ])
  end

  defp devices_changeset(devices, attrs) do
    devices
    |> cast(attrs, [:device, :status])
    |> validate_required_fields([:device, :status])
  end

  defp transform_nil_lists(%{"devices" => devices} = attrs) do
    attrs
    |> Map.put("devices", ListHelper.to_list(devices))
  end
end
