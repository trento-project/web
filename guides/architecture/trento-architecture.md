# Trento Architecture

Here's a high level view of what we do to achieve the result of providing a reactive event driven system.

![Trento Architecture](assets/trento-architecture.png)

- Discovery
- Scenario Detection
- Business rules validation
- Events & State change
- State propagation & Reaction

## Discovery
Trento Agent extracts relevant information on the target infrastructure and publishes those to the control plane.  
_(cluster discoveries, host discoveries, cloud discoveries...)_

The control plane Discovery integration securely accepts published discoveries, stores them and triggers Scenario Detection.

---

## Scenario Detection
The control plane discovery integration leverages specific policies to determine the scenario to be triggered based on the discovered information.

That means we need to be able to determine which command to dispatch in the application.
_(RegisterHost, RegisterDatabaseInstance and so forth...)_

---

## Business rule validation
The detected scenario dispatches the needed command(s) which trigger validation of the requested action(s) against the current state and the proper business rules for the usecase.

---

## Events & State change
Going through the previous steps of dispatching and action in the system and applying business rules to the process, translates in things actually happening (or not) and changing some state (or not).

When things happen we represent them as **events**  (_SAPSystemHealthChanged, ChecksExecutioncompleted_), we store them in an append only **Event Store** and use them as the source of truth of the system (or part of it).

See Event Sourcing [here](https://martinfowler.com/eaaDev/EventSourcing.html)

---

## State Propagation & Reaction
Once things happen the system notifies the world about it by emitting the recorded events so that interested components can listen for those and react accordingly.

Reaction may be any orthogonal listener responsible to deliver part of the feature being served.

Some of possible _reactions_
- projecting read optimized models for specific usecases (_Clusters, Hosts, Heartbeats_) maybe later served via APIs
- Sending and email _whenever a SAP System's health goes critical_
- Broadcasting changes to the Reactive UI via websockets
- Third party software integration
- ...
---

## Not only discovery
Notice how this document started with **Discovery** triggering actions and subsequent events in the system.

That's not the only case indeed.

The user can trigger actions via the Reactive web UI and so the _Scenario-Business Rules-Events-Reaction_ flow is the same, clearly without the Discovery.
Actions (or commands) may also be triggered via API integration, cli integration, Messaging or any other means.

This is possible thanks to an [hexagonal](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) approach to the architecture.

---

## Bonus point
We referred to Event Sourcing and you may have noticed some parallelisms with [CQRS](https://www.martinfowler.com/bliki/CQRS.html).

That's it. 

We approached architecture and development with **Agile** mindset and **Domain Driven Design** approach to properly understand the problem space and provide good solutions by leveraging **ES**, **CQRS** and **Reactivity**.

In order to **avoid accidental complexity** we don't use ES+CQRS _everywhere by default_.
Whenever possible we use simpler implementations for non-critical aspects. (_Tagging_ for instance, is a basic CRUD operation)

There's a lot of literature out there, here's just a perspective of the thing.

![ES+CQRS](assets/event-sourcing-cqrs.png)