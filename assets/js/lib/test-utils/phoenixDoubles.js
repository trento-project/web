// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

// Test/story doubles for Phoenix Channel APIs.
//
// Plain JS only — no jest.fn — so this module can be imported from Storybook
// stories as well as Jest tests. If a test needs jest.fn semantics on a
// specific method (e.g. channel.leave), use jest.spyOn(target, 'method')
// after construction.

export function makePush() {
  const handlers = {};
  const push = {
    receive: (event, cb) => {
      handlers[event] = cb;
      return push;
    },
    fire: (event, payload) => handlers[event]?.(payload),
  };
  return push;
}

export class MockChannel {
  constructor() {
    this.listeners = new Map();
    this.errorHandlers = [];
    this.closeHandlers = [];
    this.pushed = [];
    this.joinPush = makePush();
  }

  on(event, cb) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(cb);
  }

  emit(event, payload) {
    (this.listeners.get(event) || []).forEach((cb) => cb(payload));
  }

  push(event, payload) {
    const push = makePush();
    this.pushed.push({ event, payload, push });
    return push;
  }

  join() {
    return this.joinPush;
  }

  onError(cb) {
    this.errorHandlers.push(cb);
  }

  onClose(cb) {
    this.closeHandlers.push(cb);
  }

  // Test convenience: trip the registered onError/onClose listeners.
  triggerError() {
    this.errorHandlers.forEach((cb) => cb());
  }

  triggerClose() {
    this.closeHandlers.forEach((cb) => cb());
  }

  leave() {}
}

export function makeMockSocket() {
  const channels = new Map();
  return {
    channels,
    channel: (topic) => {
      if (!channels.has(topic)) channels.set(topic, new MockChannel());
      return channels.get(topic);
    },
  };
}
