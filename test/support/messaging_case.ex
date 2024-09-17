defmodule Trento.MessagingCase do
  @moduledoc """
  This test case makes sure that the messaging system is properly stubbed for tests where a defined behavior is sufficient.
  """

  use ExUnit.CaseTemplate

  setup _ do
    Mox.stub(
      Trento.Infrastructure.Messaging.Adapter.Mock,
      :publish,
      fn _, _ ->
        :ok
      end
    )

    :ok
  end
end
