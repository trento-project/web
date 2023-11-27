defmodule TrentoWeb.Auth.ApiKey do
  @moduledoc """
  This Module creates and verifies API Keys.
  """

  alias Trento.Settings

  @signing_salt "trento-api-key"

  @spec sign(map()) :: String.t()
  def sign(data) do
    # TODO: signed_at: 0 is a ugly hack to get a fixed api key.
    # Use a proper authentication
    Phoenix.Token.sign(TrentoWeb.Endpoint, @signing_salt, data, signed_at: 0, max_age: :infinity)
  end

  @spec verify(String.t()) :: {:ok, any()} | {:error, :unauthenticated}
  def verify(api_key) do
    case Phoenix.Token.verify(TrentoWeb.Endpoint, @signing_salt, api_key) do
      {:ok, data} -> {:ok, data}
      _error -> {:error, :unauthenticated}
    end
  end

  @spec get_api_key :: String.t()
  def get_api_key do
    sign(%{installation_id: Settings.get_installation_id()})
  end
end
