defmodule TrentoWeb.Plugs.ActivityLoggingPlugTest do
  @moduledoc false
  use Plug.Test
  use TrentoWeb.ConnCase, async: true

  alias TrentoWeb.Plugs.ActivityLoggingPlug

  for method <- [:get, :post, :put, :patch, :delete] do
    @method method
    test "should log activity on requests without user information - method: #{method}" do
      %{private: private} = conn = build_conn(@method, "/foo/bar", nil)
      refute Map.has_key?(private, :before_send)

      %{private: modified_private} = ActivityLoggingPlug.call(conn)

      assert Map.has_key?(modified_private, :before_send)
      assert %{before_send: [logging_function]} = modified_private

      function_info = Function.info(logging_function)

      assert Keyword.get(function_info, :module) == TrentoWeb.Plugs.ActivityLoggingPlug
      assert Keyword.get(function_info, :name) == :log_activity
    end
  end
end
