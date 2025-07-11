import { Id } from '@graphprotocol/grc-20';
import type { Mapping } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Address: {
    typeIds: [Id.Id('5c6e72fb-8340-47c0-8281-8be159ecd495')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      address: Id.Id('0d625978-4b3c-4b57-a86f-de45c997c73c'),
    },
  },
  Schedule: {
    typeIds: [Id.Id('4d876b81-787e-41fc-ab5d-075d4da66a3f')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id.Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      endTime: Id.Id('c3445f6b-e2c0-4f25-b73a-5eb876c4f50c'),
      startTime: Id.Id('2d696bf0-510f-403e-985b-8cd1e73feb9b'),
      location: Id.Id('95d77002-1faf-4f7c-b7de-b21a7d48cda0'),
    },
    relations: {
      address: Id.Id('5c6e72fb-8340-47c0-8281-8be159ecd495'),
    },
  },
};
