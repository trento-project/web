defmodule Trento.Infrastructure.SoftwareUpdates.Adapter.SumaHttpExecutorTest do
  @moduledoc false

  use ExUnit.Case

  alias Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor

  def load_certificate_content(name) do
    File.cwd!()
    |> Path.join("/test/fixtures/cert")
    |> Path.join(name)
    |> File.read!()
  end

  describe "Http executor certificate handling" do
    test "should support chained certificates" do
      scenarios = [
        %{cert: "one_entry_chain.pem", expected_entries: 1},
        %{cert: "two_entries_chain.pem", expected_entries: 2},
        %{cert: "three_entries_chain.pem", expected_entries: 3}
      ]

      for %{cert: cert, expected_entries: expected_entries} <- scenarios do
        assert cert
               |> load_certificate_content()
               |> HttpExecutor.get_cert_der()
               |> length() == expected_entries
      end
    end
  end
end
