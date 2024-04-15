defmodule Trento.Infrastructure.SoftwareUpdates.MockSuma do
  @moduledoc """
  Mocked SUMA Software updates discovery adapter
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  @impl true
  def setup, do: :ok

  @impl true
  def get_system_id(fully_qualified_domain_name),
    do:
      {:ok,
       fully_qualified_domain_name
       |> String.to_charlist()
       |> Enum.sum()}

  @impl true
  def get_relevant_patches(system_id) do
    case Map.get(mocked_relevant_patches(), system_id) do
      nil -> {:ok, []}
      patches -> {:ok, patches}
    end
  end

  @impl true
  def get_upgradable_packages(_system_id),
    do:
      {:ok,
       [
         %{
           name: "elixir",
           arch: "x86_64",
           from_version: "1.15.7",
           from_release: "3",
           from_epoch: "0",
           to_version: "1.16.2",
           to_release: "1",
           to_epoch: "0",
           to_package_id: "92348112636"
         },
         %{
           name: "systemd",
           arch: "x86_64",
           from_version: "254",
           from_release: "1",
           from_epoch: "",
           to_version: "255",
           to_release: "1",
           to_epoch: "0",
           to_package_id: "8912349843"
         }
       ]}

  @impl true
  def clear, do: :ok

  defp mocked_relevant_patches, do: Application.fetch_env!(:trento, __MODULE__)[:relevant_patches]
end
