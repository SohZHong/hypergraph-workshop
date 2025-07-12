# Hypergraph Calendar App Workshop

Welcome to the Hypergraph Calendar App! This is a simple decentralized calendar where:

- Users create private schedules (like Google Calendar entries)
- Selectively publish them to a **public space**
- Invite others to join their **private space**
- Accept invitations from others to view their private calendars

---

## Prerequisites

- Node.js 18+ (recommended via [nvm](https://github.com/nvm-sh/nvm))
- pnpm
- Git
- An email account (used for auth in Hypergraph)

---

## Getting Started

### 1. Clone the Workshop App

```bash
npx @graphprotocol/hypergraph-cli@latest create hypergraph-calendar-app
cd hypergraph-calendar-app
yarn install
```

### 2. Define Your Schema

Open `schema.ts` under `src/` folder.

Replace or add the following schema definition:

```typescript
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
```

### 3. Defining Schema Mappings

Once we define our schema, we will have to generate the relevant mappings.

> [!IMPORTANT]
> There is no cli commands to generate them dynamically for now so we will do so manually.

Head to the [Hypergraph's Schema Browser](https://schema-browser.vercel.app/).

From there, look up:

- The UUIDs of the property fields (e.g. Type.Text)
- The syntax for `properties` and `relations`

Copy the entity IDs from the browser and build the relevant mappings in `mapping.ts`

The complete file should look like this:

```typescript
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
```

### 4. Create and View Private Schedules

Now that you’ve defined your schema, let’s build the **private space** logic that lets users create and view schedules inside their own calendar space.

Open the file `src/routes/private-space/$space-id.tsx`

Replace the entire function `PrivateSpace()` with the following code:

```tsx
function PrivateSpace() {
  const { name, ready } = useSpace({ mode: 'private' });

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading space...</p>
        </div>
      </div>
    );
  }
  const { data: schedules } = useQuery(Schedule, { mode: 'private' });
  const createSchedule = useCreateEntity(Schedule);

  const [scheduleName, setScheduleName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [location, setLocation] = useState<string>();

  const handleCreateSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scheduleName || !startTime || !endTime || !description || !location) return;
    createSchedule({
      name: scheduleName,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      // address: [addressData[0].id], // we'll add this later
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
      <React.Fragment>
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
    </div>
  );
}
```

#### What Each Section Does

| Code Section                              | Explanation                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------- |
| `useSpace({ mode: 'private' })`           | Loads the current                                                         | private space (your personal calendar). |
| `useQuery(Schedule, { mode: 'private' })` | Queries all Schedule entities created inside this private space.          |
| `useCreateEntity(Schedule)`               | Lets us create a new schedule entity and store it into this space.        |
| State variables (`useState`)              | Tracks form input fields for the schedule.                                |
| `handleCreateSchedule()`                  | Validates input and creates the schedule when the form is submitted.      |
| The `<form>` section                      | Form UI for entering a new schedule (title, description, time, location). |
| The `schedules.map(...)` loop             | Displays all your previously created schedules in a nice list format.     |

### 5. Linking Identity to Schedule

Now let’s make sure every schedule is tied to a user identity by linking it with the `Address` entity.

#### What You’ll Do

- Access the logged-in user’s wallet identity.
- Query their corresponding `Address` entity from your private space.
- Link that address to each newly created schedule.
- Show a friendly label (e.g. Viewing as "Zhe") at the top of the page.

We first have to import The Graph's authentication hook. Add this to the top of your file:

```tsx
import { useHypergraphAuth } from '@graphprotocol/hypergraph-react';
```

Get the current user's identity by adding this inside `PrivateSpace()`:

```tsx
const { identity } = useHypergraphAuth();
```

Update loading logic to include identity. Change this line:

```tsx
if (!ready) {
}
```

to

```tsx
if (!ready || !identity) {
}
```

Query the current user's `Address` entity. Below the identity, add:

```tsx
const { data: addressData } = useQuery(Address, {
  filter: { address: { is: identity.address || '' } },
  mode: 'private',
});
```

This finds the Address entity created for this user (if any).

In `handleCreateSchedule()`, uncomment the `address` field:

```tsx
createSchedule({
  name: scheduleName,
  description,
  startTime: new Date(startTime),
  endTime: new Date(endTime),
  location,
  address: [addressData[0].id], // Now this works!
});
```

Now, we display the user's name from the address. Just below the form, add:

```tsx
<h3>Viewing as "{addressData[0].name}"</h3>
```

You can test the application with:

```sh
pnpm dev
```

When viewing the page, it is expected to get the error below:

![Identity name missing](/readme-images/identity-name-error.png)

This is because your wallet identity isn’t tied to any `Address` entity yet. We will address this in the next step where we create our profile manually.

### 6. Registering a User (`Address` Entity)

Now that your identity is connected, it’s time to create a user account (known as an `Address` entity) that will be linked to all schedules you make.

#### What You'll Do

- Add logic to let users create their account (`Address` entity).
- Show the schedule UI only if the account exists.
- Otherwise, prompt them to register.

> [!NOTE]
> All code changes will be done inside the function `PrivateSpace()` of `src/routes/private-space/$space-id.tsx`

We will now define the account creation logic.

Add the following:

```tsx
const createAddress = useCreateEntity(Address);
const [nickname, setNickname] = useState('');
```

Additionally, we will check whether a user already has an `Address` to prevent duplicates:

```tsx
const hasAddress = addressData && addressData.length > 0;
```

Define the handler for creating an `Address` using the current user's identity.

```tsx
const handleCreateAddress = (e: React.FormEvent) => {
  e.preventDefault();
  createAddress({
    name: nickname,
    address: identity.address,
  });
};
```

Now modify the JSX inside the `return` block to show different UIs based on whether the user already has an address:

```tsx
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
```

Load up the project again you should not be able to see the error anymore.

### 7. Publishing a Schedule to Public Space

In this step, you will be able to share their private schedule with a public space. This mimics publishing a calendar event for others to see like publicly sharing a Google Calendar event.

#### What You’ll Do

- Let users choose a public space to publish to.
- Attach a publish button to each schedule.
- Use Hypergraph’s `preparePublish` and `publishOps` to send the data over.

> [!NOTE]
> We will also be working on `PrivateSpace()` of `src/routes/private-space/$space-id.tsx` for this section.

Ensure the following imports exist at the top of your `PrivateSpace.tsx`:

```tsx
import { preparePublish, publishOps, useHypergraphApp, useSpaces } from '@graphprotocol/hypergraph-react';
import { Entity } from '@graphprotocol/hypergraph/entity';
```

We will setup your hooks and states:

```tsx
// Get all public spaces available
const { data: publicSpaces } = useSpaces({ mode: 'public' });

// Access session wallet client for publishing
const { getSmartSessionClient } = useHypergraphApp();

// Track which public space is selected per schedule
const [selectedSpaces, setSelectedSpaces] = useState<Record<string, string>>({});
```

We will also define our handler for publishing, add the following:

```tsx
const publishToPublicSpace = async (schedule: Entity<typeof Schedule>) => {
  const selectedSpace = selectedSpaces[schedule.id];
  if (!selectedSpace) {
    alert('Please select a public space');
    return;
  }

  try {
    const { ops } = await preparePublish({
      entity: schedule,
      publicSpace: selectedSpace,
    });

    const smartSessionClient = await getSmartSessionClient();
    if (!smartSessionClient) throw new Error('No session client');

    const result = await publishOps({
      ops,
      space: selectedSpace,
      name: 'Publish Schedule',
      walletClient: smartSessionClient,
    });

    console.log('Published:', result);
    alert('Schedule published to public space!');
  } catch (err) {
    console.error('Publish failed', err);
    alert('Failed to publish schedule');
  }
};
```

To allow user interaction, we will also add a **dropdown** and **publish** button under each listed schedule.

Inside the `.map()` block that renders schedules, paste this after the time display:

```jsx
<div className="mt-3">
  <select
    value={selectedSpaces[schedule.id] || ''}
    onChange={(e) => setSelectedSpaces((prev) => ({ ...prev, [schedule.id]: e.target.value }))}
    className="border p-2 mr-2"
  >
    <option value="">Select public space</option>
    {publicSpaces?.map((space) => (
      <option key={space.id} value={space.id}>
        {space.name}
      </option>
    ))}
  </select>
  <Button onClick={() => publishToPublicSpace(schedule)} className="bg-green-600 text-white px-3 py-1 rounded">
    Publish
  </Button>
</div>
```

Boot up your project, you will see under each schedule, there is a green publish button and a selection of public spaces.

Try them out!

### 8. Viewing Schedules in a Public Space

Now that users can publish their schedules to public spaces, we’ll build the interface that anyone can use to view them.

> [!NOTE]
> We will be working on `PublicSpace()` of `src/routes/public-space/$space-id.tsx` for this section.

Since we already have a template for us, we simply change any mentions of `Address` entity to `Schedule` entity.

For example, we change:

```tsx
const { data: addresses } = useQuery(Address, { mode: 'public' });
```

to

```tsx
const { data: schedules } = useQuery(Schedule, { mode: 'public' });
```

This ensures we fetch all the `Schedule` entities that have been published into this public space.

Update any variable names or mappings from `addresses` to `schedules`, and `address` to `schedule`. This includes within JSX and logic like .`map(...)`.

#### (Optional) Replace the Render Block

If you're struggling to replace all instances, you can replace the main render section entirely with this block:

```jsx
<div className="flex flex-col h-screen">
  <h1 className="text-2xl font-bold">{name}</h1>
  <ul>
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
  </ul>
</div>
```

> [!NOTE]
> Paste this directly under the `{/* Main Content */}` comment in your `/public-space/$space-id.tsx` file.

### 9. Inviting Others to Your Private Space

Now let’s implement the logic that allows a user to invite another Hypergraph user (by wallet address) to collaborate inside their private space.

> [!IMPORTANT]
> The actual invitation functionality is currently commented out due to pending support from Hypergraph. You’ll implement the interface and handler now, and simply uncomment one line when support is available.

> [!NOTE]
> All code changes will be done inside the function `PrivateSpace()` of `src/routes/private-space/$space-id.tsx`

Extend `useHypergraphApp()` to include the invite feature:

```tsx
const { getSmartSessionClient, inviteToSpace } = useHypergraphApp();
```

Somewhere near the top of your component, define the state for the invite address:

```tsx
const [inviteAddress, setInviteAddress] = useState<`0x${string}`>();
```

Below your other event handlers, add the following handler:

```tsx
const handleInviteToSpace = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!inviteAddress) return alert('No address provided');

  try {
    // TODO: Uncomment this once Hypergraph support is live
    // await inviteToSpace({
    //   space: id,
    //   invitee: {
    //     accountAddress: inviteAddress,
    //   },
    // });

    alert('Invitation Sent!');
    setInviteAddress(undefined);
  } catch (err) {
    console.error(err);
    alert('Failed to send invitation');
  }
};
```

This will eventually send the invitation once the backend support is available.

Place the following block above your schedule form JSX to show the invite input form:

```tsx
{
  /* Invitations */
}
<div className="mt-6">
  <h2 className="font-semibold text-lg">Invite Someone to This Space</h2>
  <form onSubmit={handleInviteToSpace} className="flex flex-col gap-2 max-w-md mt-2">
    <input
      type="text"
      placeholder="0x123... address"
      value={inviteAddress}
      onChange={(e) => setInviteAddress(e.target.value as `0x${string}`)}
      className="border p-2"
    />
    <Button type="submit" className="bg-purple-600 text-white px-4 py-2">
      Send Invite
    </Button>
  </form>
</div>;
```

You should now see a form in your webpage for sending invitations.

### 10. Display and Accept Invitations from Navbar

Hypergraph manages invitations in a reactive state store. You’ll now extend the space menu to list invitations and allow users to accept them directly.

> [!NOTE]
> We will be editing `src/components/space-menu.tsx` for this section.

Install the dependency:

```sh
pnpm add @xstate/store
```

At the top of the file, add imports:

```tsx
import { useSpaces, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { useSelector } from '@xstate/store/react';
import { store } from '@graphprotocol/hypergraph';
```

Inside your `SpacesMenu` component (alongside `useSpaces`), add:

```tsx
const { listInvitations, acceptInvitation } = useHypergraphApp();
```

Then after fetching spaces, fetch invitations:

```tsx
// Request and store invitations to Hypergraph store after spaces have loaded
if (publicSpaces && privateSpaces) {
  listInvitations();
}
```

Then use the selector to read them from the store:

```tsx
const invitations = useSelector(store, (state) => state.context.invitations);
```

Inside the same component, we will add the handler for accepting invites:

```tsx
const handleAcceptInvitation = (invitation: {
  readonly id: string;
  readonly previousEventHash: string;
  readonly spaceId: string;
}) => {
  acceptInvitation({
    invitation,
  });
};
```

Paste the following block after the `Public Spaces` and separator blocks in your existing JSX:

```tsx
{
  /* Separator */
}
<li className="border-t border-border my-2" />;

{
  /* Invitations Section */
}
<li>
  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Invitations</div>
  {invitations && invitations.length > 0 ? (
    <div className="space-y-1">
      {invitations.map((invitation) => (
        <NavigationMenuLink asChild key={invitation.id}>
          <Link
            to="/private-space/$space-id"
            params={{ 'space-id': invitation.spaceId }}
            className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            <div onClick={() => handleAcceptInvitation(invitation)} className="text-sm font-medium leading-none">
              {invitation.spaceId}
            </div>
          </Link>
        </NavigationMenuLink>
      ))}
    </div>
  ) : (
    <div className="text-sm text-muted-foreground p-2">No invitations found</div>
  )}
</li>;
```

Congratulations! Users can now:

- See a section labeled “Invitations” in the dropdown.
- accept an invitation and be redirected to the private space.

## Credits

This app was built using [Hypergraph](https://github.com/geobrowser/hypergraph-app-template) by The Graph Protocol.

Happy building!
