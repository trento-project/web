# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

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

  test "should return the resource metadata" do
    %{database_id: database_id, sid: sid} = instance = build(:database_instance)

    assert %{id: database_id, label: sid, type: :database} ==
             DatabaseInstancePolicy.metadata(instance)
  end
end
