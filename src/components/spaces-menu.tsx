import { NavigationMenuContent, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { useHypergraphApp, useSpaces } from '@graphprotocol/hypergraph-react';
import { Link } from '@tanstack/react-router';
import { useSelector } from '@xstate/store/react';
import { store } from '@graphprotocol/hypergraph';

export function SpacesMenu() {
  const { data: publicSpaces, isPending: publicSpacesPending } = useSpaces({ mode: 'public' });
  const { data: privateSpaces, isPending: privateSpacesPending } = useSpaces({ mode: 'private' });

  const isLoading = publicSpacesPending || privateSpacesPending;

  const { listInvitations, acceptInvitation } = useHypergraphApp();
  // Request and store invitations to Hypergraph store after spaces have loaded
  if (publicSpaces && privateSpaces) {
    listInvitations();
  }

  const invitations = useSelector(store, (state) => state.context.invitations);

  const handleAcceptInvitation = (invitation: {
    readonly id: string;
    readonly previousEventHash: string;
    readonly spaceId: string;
  }) => {
    acceptInvitation({
      invitation,
    });
  };

  if (isLoading) {
    return (
      <NavigationMenuContent>
        <ul className="grid w-[300px] gap-3 p-4">
          <li className="text-sm text-muted-foreground">Loading spaces...</li>
        </ul>
      </NavigationMenuContent>
    );
  }

  return (
    <NavigationMenuContent>
      <ul className="grid w-[300px] gap-3 p-4">
        {/* Private Spaces Section */}
        <li>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Private Spaces</div>
          {privateSpaces && privateSpaces.length > 0 ? (
            <div className="space-y-1">
              {privateSpaces.map((space) => (
                <NavigationMenuLink asChild key={space.id}>
                  <Link
                    to="/private-space/$space-id"
                    params={{ 'space-id': space.id }}
                    className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">{space.name}</div>
                  </Link>
                </NavigationMenuLink>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-2">No private spaces found</div>
          )}
        </li>

        {/* Separator */}
        <li className="border-t border-border my-2" />

        {/* Public Spaces Section */}
        <li>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Public Spaces</div>
          {publicSpaces && publicSpaces.length > 0 ? (
            <div className="space-y-1">
              {publicSpaces.map((space) => (
                <NavigationMenuLink asChild key={space.id}>
                  <Link
                    to="/public-space/$space-id"
                    params={{ 'space-id': space.id }}
                    className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">{space.name}</div>
                  </Link>
                </NavigationMenuLink>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-2">No public spaces found</div>
          )}
        </li>

        {/* Separator */}
        <li className="border-t border-border my-2" />

        {/* Invitations Section */}
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
                    <div
                      onClick={() => handleAcceptInvitation(invitation)}
                      className="text-sm font-medium leading-none"
                    >
                      {invitation.spaceId}
                    </div>
                  </Link>
                </NavigationMenuLink>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-2">No invitations found</div>
          )}
        </li>
      </ul>
    </NavigationMenuContent>
  );
}
