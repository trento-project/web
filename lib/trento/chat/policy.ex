defmodule Trento.Chat.Policy do
  @moduledoc """
  Policy for the Chat resource
  """
  @behaviour Bodyguard.Policy

  alias Trento.Users.User

  # Allow all authenticated users to use chat
  def authorize(:chat, %User{} = _user, _params), do: true

  def authorize(_, _, _), do: false
end
