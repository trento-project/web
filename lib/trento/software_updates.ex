defmodule Trento.SoftwareUpdates do
  @moduledoc """
  Entry point for the software updates feature.
  """

  alias Trento.Repo
  alias Trento.SoftwareUpdates.Settings

  @type software_update_settings :: %{
          url: String.t(),
          username: String.t(),
          password: String.t(),
          ca_cert: String.t() | nil,
          ca_uploaded_at: DateTime.t() | nil
        }

  @spec get_settings :: {:ok, software_update_settings} | {:error, :settings_not_configured}
  def get_settings do
    %Settings{
      url: url,
      username: username,
      password: password,
      ca_cert: ca_cert,
      ca_uploaded_at: ca_uploaded_at
    } = settings = Repo.one!(Settings)

    if has_valid_settings?(settings) do
      {
        :ok,
        %{
          url: url,
          username: username,
          password: password,
          ca_cert: ca_cert,
          ca_uploaded_at: ca_uploaded_at
        }
      }
    else
      {:error, :settings_not_configured}
    end
  end

  defp has_valid_settings?(%Settings{url: url, username: username, password: password}),
    do: url != nil and username != nil and password != nil
end
