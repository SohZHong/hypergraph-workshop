import { Button } from '@/components/ui/button';
import { Address, Schedule } from '@/schema';
import {
  HypergraphSpaceProvider,
  useCreateEntity,
  useHypergraphAuth,
  useQuery,
  useSpace,
} from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { useState } from 'react';

export const Route = createFileRoute('/private-space/$space-id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { 'space-id': spaceId } = Route.useParams();

  return (
    <HypergraphSpaceProvider space={spaceId}>
      <PrivateSpace />
    </HypergraphSpaceProvider>
  );
}

function PrivateSpace() {
  const { name, ready } = useSpace({ mode: 'private' });
  const { identity } = useHypergraphAuth();

  if (!ready || !identity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading space...</p>
        </div>
      </div>
    );
  }
  const { data: addressData } = useQuery(Address, {
    filter: { address: { is: identity.address || '' } },
    mode: 'private',
  });
  const createAddress = useCreateEntity(Address);

  const { data: schedules } = useQuery(Schedule, { mode: 'private' });
  const createSchedule = useCreateEntity(Schedule);

  const [nickname, setNickname] = useState('');
  const [scheduleName, setScheduleName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [location, setLocation] = useState<string>();

  const hasAddress = addressData && addressData.length > 0;

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    createAddress({
      name: nickname,
      address: identity.address,
    });
  };

  const handleCreateSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scheduleName || !startTime || !endTime || !description || !location) return;
    createSchedule({
      name: scheduleName,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      address: [addressData[0].id],
    });

    setScheduleName('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setLocation('');
  };

  return (
    <div className="">
      <h1>{name}</h1>
      {/* Schedules */}
      {!hasAddress ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Create Your Account</h2>
          <form onSubmit={handleCreateAddress} className="flex flex-col gap-2 max-w-sm mt-2">
            <input
              type="text"
              placeholder="Enter your name or nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="border p-2"
            />
            <Button type="submit" className="bg-blue-500 text-white px-4 py-2">
              Create Account
            </Button>
          </form>
        </div>
      ) : (
        <React.Fragment>
          <h3>Viewing as "{addressData[0].name}"</h3>
          <form onSubmit={handleCreateSchedule} className="flex flex-col gap-2 max-w-md">
            <input
              type="text"
              placeholder="Schedule title"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              className="border p-2"
            />
            <input
              type="text"
              placeholder="Schedule Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2"
            />
            <input
              type="text"
              placeholder="Schedule Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border p-2"
            />
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border p-2"
            />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border p-2"
            />
            <Button type="submit" className="bg-blue-500 text-white px-4 py-2">
              Add Schedule
            </Button>
          </form>
          <div className="grid gap-3 mt-6">
            {schedules.map((schedule, index) => (
              <div key={index} className="border border-gray-300 p-4 rounded shadow-sm bg-white">
                <div className="font-bold">{schedule.name}</div>
                <div className="font-bold">{schedule.location}</div>
                <div className="text-sm text-gray-500">
                  {new Date(Number(schedule.startTime)).toLocaleString()} →{' '}
                  {new Date(Number(schedule.endTime)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
