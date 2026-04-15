defmodule Trento.Operations.DatabaseInstancePolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  alias Trento.Operations.DatabaseInstancePolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    instance = build(:database_instance)

    assert {:error, [%{message: "Unknown operation", metadata: []}]} ==
             DatabaseInstancePolicy.authorize_operation(:unknown, instance, %{})
  end
end
