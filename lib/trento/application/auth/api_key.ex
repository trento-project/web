defmodule Trento.Application.Auth.ApiKey do
  @moduledoc """
  This Module creates and verifies API Keys.
  """

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
end
