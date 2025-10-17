defmodule TrentoWeb.Auth.PersonalAccessToken do
  @moduledoc """
  PersonalAccessToken represents a users' generated token.
  """

  @aud "trento_pat"
  @prefix @aud <> "_"

  @spec aud :: String.t()
  def aud, do: @aud

  @spec prefix :: String.t()
  def prefix, do: @prefix

  def generate do
    @prefix <>
      (64
       |> :crypto.strong_rand_bytes()
       |> Base.url_encode64(padding: false))
  end
end
