defimpl Jason.Encoder, for: AgenticRuntime.Conversations.DisplayMessage do
  def encode(value, opts) do
    Jason.Encode.map(value.content, opts)
  end
end

defimpl Jason.Encoder, for: AgUi.Core.Events.RunStarted do
  def encode(value, _opts) do
    AgUi.Encoder.EventEncoder.encode(value)
  end
end

defimpl Jason.Encoder, for: AgUi.Core.Events.RunFinished do
  def encode(value, _opts) do
    AgUi.Encoder.EventEncoder.encode(value)
  end
end
defimpl Jason.Encoder, for: AgUi.Core.Events.TextMessageContent do
  def encode(value, _opts) do
    AgUi.Encoder.EventEncoder.encode(value)
  end
end
