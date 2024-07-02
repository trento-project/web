defmodule Trento.ActivityLogging.ActivityParser do
  @moduledoc """
  Behavior for activity parsers.
  It extracts the activity relevant information from the context.
  """

  alias Trento.ActivityLogging.Registry

  @callback detect_activity(activity_context :: any()) :: Registry.logged_activity() | nil

  @callback get_activity_actor(
              activity :: Registry.logged_activity(),
              activity_context :: any()
            ) :: any()

  @callback get_activity_metadata(
              activity :: Registry.logged_activity(),
              activity_context :: any()
            ) :: map()
end
