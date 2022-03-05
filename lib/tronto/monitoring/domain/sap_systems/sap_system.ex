defmodule Tronto.Monitoring.Domain.SapSystem do
  @moduledoc false

  alias Tronto.Monitoring.Domain.SapSystem

  alias Tronto.Monitoring.Domain.SapSystem.{
    Application,
    Database,
    Instance
  }

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterDatabaseInstance
  }

  alias Tronto.Monitoring.Domain.Events.{
    ApplicationInstanceRegistered,
    ApplicationRegistered,
    DatabaseInstanceRegistered,
    DatabaseRegistered,
    SapSystemRegistered,
    SapSystemRegistrationStarted
  }

  defstruct [
    :sap_system_id,
    :sid,
    :database,
    :application
  ]

  @type t :: %__MODULE__{
          sap_system_id: String.t(),
          sid: String.t(),
          database: Database,
          application: Application
        }

  # First time that a DatbaseInstance is registered, the SAP System starts its registration process.
  # When an Application is discovered, the SAP System completes the registration process.
  def execute(
        %SapSystem{sap_system_id: nil},
        %RegisterDatabaseInstance{
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          host_id: host_id,
          instance_number: instance_number,
          features: features
        }
      ) do
    %DatabaseInstanceRegistered{
      sap_system_id: sap_system_id,
      sid: sid,
      tenant: tenant,
      instance_number: instance_number,
      features: features,
      host_id: host_id
    }
  end

  def execute(
        %SapSystem{database: %Database{instances: instances}},
        %RegisterDatabaseInstance{
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id
        }
      ) do
    instances
    |> Enum.any?(fn
      %Instance{host_id: ^host_id, instance_number: ^instance_number} ->
        # TODO should we check if the features and updated them?
        true

      _ ->
        false
    end)
    |> unless do
      %DatabaseInstanceRegistered{
        sap_system_id: sap_system_id,
        sid: sid,
        tenant: tenant,
        instance_number: instance_number,
        features: features,
        host_id: host_id
      }
    end
  end

  def execute(
        %SapSystem{application: nil},
        %RegisterApplicationInstance{
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: instance_number,
          tenant: tenant,
          db_host: db_host,
          features: features,
          host_id: host_id
        }
      ) do
    [
      %SapSystemRegistered{
        sap_system_id: sap_system_id,
        sid: sid,
        tenant: tenant,
        db_host: db_host
      },
      %ApplicationInstanceRegistered{
        sap_system_id: sap_system_id,
        sid: sid,
        instance_number: instance_number,
        features: features,
        host_id: host_id
      }
    ]
  end

  def execute(
        %SapSystem{application: %Application{instances: instances}},
        %RegisterApplicationInstance{
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: instance_number,
          features: features,
          host_id: host_id
        }
      ) do
    instances
    |> Enum.any?(fn
      %Instance{host_id: ^host_id, instance_number: ^instance_number} ->
        # TODO should we check if the features and updated them?
        true

      _ ->
        false
    end)
    |> unless do
      %ApplicationInstanceRegistered{
        sap_system_id: sap_system_id,
        sid: sid,
        instance_number: instance_number,
        features: features,
        host_id: host_id
      }
    end
  end

  def apply(
        %SapSystem{sap_system_id: nil},
        %DatabaseInstanceRegistered{
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id
        }
      ) do
    %SapSystem{
      sap_system_id: sap_system_id,
      database: %Database{
        sid: sid,
        tenant: tenant,
        instances: [
          %Instance{
            sid: sid,
            instance_number: instance_number,
            features: features,
            host_id: host_id
          }
        ]
      }
    }
  end

  def apply(
        %SapSystem{database: %Database{instances: instances} = database} = sap_system,
        %DatabaseInstanceRegistered{
          sid: sid,
          instance_number: instance_number,
          features: features,
          host_id: host_id
        }
      ) do
    database = %Database{
      database
      | instances: [
          %Instance{
            sid: sid,
            instance_number: instance_number,
            features: features,
            host_id: host_id
          }
          | instances
        ]
    }

    %SapSystem{
      sap_system
      | database: database
    }
  end

  def apply(
        %SapSystem{application: nil} = sap_system,
        %ApplicationInstanceRegistered{
          sid: sid,
          instance_number: instance_number,
          features: features,
          host_id: host_id
        }
      ) do
    application = %Application{
      sid: sid,
      instances: [
        %Instance{
          sid: sid,
          instance_number: instance_number,
          features: features,
          host_id: host_id
        }
      ]
    }

    %SapSystem{
      sap_system
      | application: application
    }
  end

  def apply(
        %SapSystem{application: %Application{instances: instances} = application} = sap_system,
        %ApplicationInstanceRegistered{
          sid: sid,
          instance_number: instance_number,
          features: features,
          host_id: host_id
        }
      ) do
    application = %Application{
      application
      | instances: [
          %Instance{
            sid: sid,
            instance_number: instance_number,
            features: features,
            host_id: host_id
          }
          | instances
        ]
    }

    %SapSystem{
      sap_system
      | application: application
    }
  end

  def apply(%SapSystem{} = sap_system, %SapSystemRegistered{sid: sid}) do
    %SapSystem{
      sap_system
      | sid: sid
    }
  end
end
