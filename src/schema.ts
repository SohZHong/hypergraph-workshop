import { Entity, Type } from '@graphprotocol/hypergraph';
export class Address extends Entity.Class<Address>('Address')({
  name: Type.Text,
  address: Type.Text,
}) {}

export class Schedule extends Entity.Class<Schedule>('Schedule')({
  name: Type.Text,
  description: Type.Text,
  endTime: Type.Date,
  startTime: Type.Date,
  location: Type.Text,
  address: Type.Relation(Address),
}) {}
