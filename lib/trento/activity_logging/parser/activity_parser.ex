defmodule Trento.ActivityLog.Parser.ActivityParser do
  @moduledoc """
  Behavior for activity parsers.
  It extracts the activity relevant information from the context.
  """

  alias Trento.ActivityLog.ActivityCatalog

  @callback detect_activity(activity_context :: any()) :: ActivityCatalog.logged_activity() | nil

  @callback get_activity_actor(
              activity :: ActivityCatalog.logged_activity(),
              activity_context :: any()
            ) :: any()

  @callback get_activity_metadata(
              activity :: ActivityCatalog.logged_activity(),
              activity_context :: any()
            ) :: map()
end
