  defimpl Jason.Encoder, for: AgenticRuntime.Conversations.DisplayMessage do
    def encode(value, opts) do
      Jason.Encode.map(value.content, opts)
    end
  end
