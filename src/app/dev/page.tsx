'use client';

import { toast } from '@/components/ui/use-toast';
import { useApi } from '@/contexts/ApiContext';
import { useAuth, User } from '@/contexts/AuthContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useInvoices } from '@/contexts/InvoicesContext';
import { useProjectFiles } from '@/contexts/ProjectFilesContext';
import { useTemplates } from '@/contexts/TemplatesContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Only show in development
const isDevelopment = process.env.NODE_ENV !== 'production';

function safeStringify(obj: any, fallback: string = '{}') {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    console.error('Failed to stringify object:', error);
    return fallback;
  }
}

// Function to initialize mock users for debug purposes
const loadMockUsers = () => {
  const mockUsers = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      imageUrl: 'https://ui-avatars.com/api/?name=Admin+User',
    },
    {
      id: '2',
      name: 'Client User',
      email: 'client@example.com',
      password: 'password123',
      role: 'client',
      imageUrl: 'https://ui-avatars.com/api/?name=Client+User',
    },
    {
      id: '3',
      name: 'Photographer',
      email: 'photographer@example.com',
      password: 'password123',
      role: 'photographer',
      imageUrl: 'https://ui-avatars.com/api/?name=Photographer',
    },
  ];

  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  return mockUsers;
};

export default function DevPage() {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  // Extract what we need with optional chaining
  const { user, isAuthenticated, login, logout, register } = auth || {};

  // Get all contexts to display their state
  const apiContext = useApi();
  const projectFilesContext = useProjectFiles();
  const inventoryContext = useInventory();
  const invoicesContext = useInvoices();
  const templatesContext = useTemplates();

  // Ensure component is only rendered on client side
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safely format context data
  const safeStringify = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return '{ "error": "Unable to stringify context" }';
    }
  };

  // States for the dev page
  const [activeTab, setActiveTab] = useState('users');
  const [mockUsers, setMockUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [appRoutes, setAppRoutes] = useState<string[]>([]);
  const [localStorageItems, setLocalStorageItems] = useState<{ key: string; value: string }[]>([]);
  const [sessionStorageItems, setSessionStorageItems] = useState<{ key: string; value: string }[]>(
    [],
  );
  const [devOptions, setDevOptions] = useState({
    slowNetworkSimulation: false,
    forceErrors: false,
    logApiCalls: false,
  });

  // Load mock users and routes
  useEffect(() => {
    if (!isDevelopment) {
      router.push('/');
      return;
    }

    // Load mock users from localStorage
    const loadMockUsers = () => {
      try {
        // Get mock users directly
        const usersJson = localStorage.getItem('mock_users');
        const storedUsers = usersJson ? JSON.parse(usersJson) : [];

        // Default users if none found
        if (!storedUsers || storedUsers.length === 0) {
          const defaultUsers: User[] = [
            {
              id: '1',
              email: 'admin@example.com',
              name: 'Admin User',
              role: 'admin',
            },
            {
              id: '2',
              email: 'user@example.com',
              name: 'Regular User',
              role: 'user',
            },
          ];
          localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
          setMockUsers(defaultUsers);
        } else {
          setMockUsers(storedUsers);
        }
      } catch (error) {
        console.error('Failed to load mock users:', error);
        setMockUsers([]);
      }
    };

    // Get application routes by scanning the file system
    // This is a simplified representation - in a real app you'd get this from Next.js
    const appRoutes = [
      '/',
      '/login',
      '/register',
      '/profile',
      '/admin',
      '/projects',
      '/dev',
      '/settings',
    ];
    setAppRoutes(appRoutes);

    // Get localStorage items
    const getLocalStorageItems = () => {
      const items: { key: string; value: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key) || '';
            items.push({ key, value });
          } catch (error) {
            console.error(`Error reading localStorage key ${key}:`, error);
          }
        }
      }
      return items;
    };

    // Get sessionStorage items
    const getSessionStorageItems = () => {
      const items: { key: string; value: string }[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          try {
            const value = sessionStorage.getItem(key) || '';
            items.push({ key, value });
          } catch (error) {
            console.error(`Error reading sessionStorage key ${key}:`, error);
          }
        }
      }
      return items;
    };

    loadMockUsers();
    setLocalStorageItems(getLocalStorageItems());
    setSessionStorageItems(getSessionStorageItems());

    // Set up a refresh interval to keep storage data in sync
    const refreshInterval = setInterval(() => {
      setLocalStorageItems(getLocalStorageItems());
      setSessionStorageItems(getSessionStorageItems());
    }, 2000);

    return () => clearInterval(refreshInterval);
  }, [router]);

  // Handle user creation
  const handleCreateUser = () => {
    const id = String(mockUsers.length + 1);
    const newMockUser = {
      id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'admin' | 'user',
    };

    const updatedUsers = [...mockUsers, newMockUser];
    setMockUsers(updatedUsers);
    localStorage.setItem('mock_users', JSON.stringify(updatedUsers));

    // Reset form
    setNewUser({ name: '', email: '', password: '', role: 'user' });
  };

  // Handle user deletion
  const handleDeleteUser = (id: string) => {
    const updatedUsers = mockUsers.filter((user) => user.id !== id);
    setMockUsers(updatedUsers);
    localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
  };

  // Handle user role change
  const handleRoleChange = (id: string, newRole: 'admin' | 'user') => {
    const updatedUsers = mockUsers.map((user) =>
      user.id === id ? { ...user, role: newRole } : user,
    );
    setMockUsers(updatedUsers);
    localStorage.setItem('mock_users', JSON.stringify(updatedUsers));

    // If the current user's role is changing, update localStorage
    if (user && user.id === id) {
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      // Force a page refresh to update the UI with new permissions
      window.location.reload();
    }
  };

  // Handle login as a specific user
  const handleLoginAs = (userEmail: string) => {
    // Use the existing login function but bypass password check
    login(userEmail, 'any-password-works-in-dev-mode')
      .then(() => {
        // Redirect to home page
        router.push('/');
      })
      .catch((error) => {
        console.error('Failed to login as user:', error);
      });
  };

  // Handle dev option change
  const handleDevOptionChange = (option: keyof typeof devOptions, value: boolean) => {
    setDevOptions((prev) => ({
      ...prev,
      [option]: value,
    }));

    // Save to localStorage for persistence
    localStorage.setItem(
      'dev_options',
      JSON.stringify({
        ...devOptions,
        [option]: value,
      }),
    );

    // Apply the changes
    if (option === 'slowNetworkSimulation') {
      // In a real app, you'd configure network delays here
      console.log('Network simulation:', value ? 'slow' : 'normal');
    } else if (option === 'forceErrors') {
      // In a real app, you'd configure error simulation here
      console.log('Force errors:', value ? 'enabled' : 'disabled');
    } else if (option === 'logApiCalls') {
      // In a real app, you'd configure API call logging here
      console.log('API call logging:', value ? 'enabled' : 'disabled');
    }
  };

  // Handle clearing storage
  const clearStorage = (type: 'local' | 'session' | 'both') => {
    if (type === 'local' || type === 'both') {
      localStorage.clear();
      setLocalStorageItems([]);
    }
    if (type === 'session' || type === 'both') {
      sessionStorage.clear();
      setSessionStorageItems([]);
    }

    // Reload the page to reset app state
    window.location.reload();
  };

  // Format JSON for display
  const formatJSON = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  const handleResetMockData = () => {
    try {
      // Reset mock users
      const users = loadMockUsers();

      // Clear other mock data if needed
      localStorage.removeItem('mockProjects');
      localStorage.removeItem('mockFiles');
      localStorage.removeItem('mockInvoices');

      toast({
        title: 'Mock Data Reset',
        description: `Reset ${users.length} mock users and cleared other mock data`,
        duration: 3000,
      });

      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset mock data:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset mock data',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // If not in development, show nothing or redirect
  if (!isDevelopment) {
    return (
      <div className='container mx-auto p-6'>This page is only available in development mode.</div>
    );
  }

  // If not mounted yet, show loading state
  if (!mounted) {
    return <div className='container mx-auto p-6 animate-pulse'>Loading developer tools...</div>;
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Developer Tools</h1>
          <p className='text-gray-600 mt-1'>Debug and develop your Pulse application</p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='px-3 py-1'>
            Environment: {process.env.NODE_ENV}
          </Badge>
          <Button variant='outline' asChild size='sm'>
            <Link href='/'>Back to App</Link>
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue='users'
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid grid-cols-6 gap-2'>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='auth'>Authentication</TabsTrigger>
          <TabsTrigger value='routes'>Routes</TabsTrigger>
          <TabsTrigger value='storage'>Storage</TabsTrigger>
          <TabsTrigger value='context'>App Context</TabsTrigger>
          <TabsTrigger value='settings'>Dev Settings</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value='users' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Mock Users</CardTitle>
              <CardDescription>
                Manage and modify user accounts for testing different roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-lg font-medium mb-4'>Existing Users</h3>
                  <div className='space-y-3'>
                    {mockUsers.map((mockUser) => (
                      <div key={mockUser.id} className='border rounded-lg p-3'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='font-medium'>{mockUser.name}</div>
                            <div className='text-sm text-gray-500'>{mockUser.email}</div>
                            <div className='flex items-center mt-1'>
                              <Badge
                                variant={mockUser.role === 'admin' ? 'default' : 'secondary'}
                                className='mr-2'
                              >
                                {mockUser.role}
                              </Badge>
                              <span className='text-xs text-gray-500'>ID: {mockUser.id}</span>
                            </div>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Select
                              defaultValue={mockUser.role}
                              onValueChange={(value) =>
                                handleRoleChange(mockUser.id, value as 'admin' | 'user')
                              }
                            >
                              <SelectTrigger className='w-[110px]'>
                                <SelectValue placeholder='Role' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='user'>User</SelectItem>
                                <SelectItem value='admin'>Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className='flex gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='w-full'
                                onClick={() => handleLoginAs(mockUser.email)}
                              >
                                Login As
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleDeleteUser(mockUser.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className='text-lg font-medium mb-4'>Create New User</h3>
                  <div className='space-y-3'>
                    <div className='space-y-2'>
                      <Label htmlFor='name'>Name</Label>
                      <Input
                        id='name'
                        placeholder="User's full name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        type='email'
                        placeholder='user@example.com'
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='password'>Password (for record only)</Label>
                      <Input
                        id='password'
                        type='password'
                        placeholder='Password (ignored in mock auth)'
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='role'>Role</Label>
                      <Select
                        defaultValue={newUser.role}
                        onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                      >
                        <SelectTrigger id='role'>
                          <SelectValue placeholder='Select role' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='user'>User</SelectItem>
                          <SelectItem value='admin'>Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className='w-full mt-4'
                      onClick={handleCreateUser}
                      disabled={!newUser.name || !newUser.email}
                    >
                      Create User
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value='auth' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Authentication State</CardTitle>
              <CardDescription>View and manage the current authentication state</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-lg font-medium mb-4'>Current User</h3>
                  {isAuthenticated ? (
                    <div className='border rounded-lg p-4'>
                      <div className='font-medium text-lg'>{user?.name}</div>
                      <div className='text-gray-500 mb-2'>{user?.email}</div>
                      <Badge className='mb-3'>{user?.role}</Badge>
                      <div className='text-sm text-gray-500 mt-2'>
                        <div>ID: {user?.id}</div>
                        <div className='mt-1'>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
                      </div>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => logout()}
                        className='mt-4'
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className='border rounded-lg p-4 text-center'>
                      <div className='text-gray-500 mb-3'>Not logged in</div>
                      <Button variant='default' size='sm' onClick={() => router.push('/login')}>
                        Go to Login
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className='text-lg font-medium mb-4'>Auth Actions</h3>
                  <div className='space-y-4'>
                    <div className='border rounded-lg p-4'>
                      <h4 className='font-medium mb-2'>Quick Login</h4>
                      <div className='grid grid-cols-2 gap-2'>
                        <Button
                          size='sm'
                          onClick={() => handleLoginAs('admin@example.com')}
                          className='w-full'
                        >
                          Login as Admin
                        </Button>
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() => handleLoginAs('user@example.com')}
                          className='w-full'
                        >
                          Login as User
                        </Button>
                      </div>
                    </div>

                    <div className='border rounded-lg p-4'>
                      <h4 className='font-medium mb-2'>Auth Storage</h4>
                      <div className='space-y-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            localStorage.removeItem('auth_user');
                            window.location.reload();
                          }}
                          className='w-full'
                        >
                          Clear Auth Data
                        </Button>
                      </div>
                      <div className='mt-3 text-xs text-gray-500'>
                        This will remove the current user from localStorage
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value='routes' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Application Routes</CardTitle>
              <CardDescription>
                View and navigate to all available routes in the application
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='border rounded-lg divide-y'>
                {appRoutes.map((route) => (
                  <div key={route} className='p-3 flex justify-between items-center'>
                    <div>
                      <code className='bg-muted px-2 py-1 rounded text-sm'>{route}</code>
                      {route === pathname && (
                        <Badge variant='secondary' className='ml-2'>
                          Current
                        </Badge>
                      )}
                    </div>
                    <Button asChild variant='outline' size='sm'>
                      <Link href={route}>Visit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value='storage' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Browser Storage</CardTitle>
              <CardDescription>View and manage localStorage and sessionStorage</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-end mb-2 gap-2'>
                <Button variant='outline' size='sm' onClick={() => clearStorage('local')}>
                  Clear localStorage
                </Button>
                <Button variant='outline' size='sm' onClick={() => clearStorage('session')}>
                  Clear sessionStorage
                </Button>
                <Button variant='outline' size='sm' onClick={() => clearStorage('both')}>
                  Clear All
                </Button>
              </div>

              <Tabs defaultValue='localStorage'>
                <TabsList>
                  <TabsTrigger value='localStorage'>
                    localStorage ({localStorageItems.length})
                  </TabsTrigger>
                  <TabsTrigger value='sessionStorage'>
                    sessionStorage ({sessionStorageItems.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value='localStorage' className='mt-4'>
                  {localStorageItems.length > 0 ? (
                    <div className='border rounded-lg divide-y'>
                      {localStorageItems.map(({ key, value }) => (
                        <div key={key} className='p-3'>
                          <div className='flex justify-between items-center'>
                            <code className='bg-muted px-2 py-1 rounded text-sm'>{key}</code>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                localStorage.removeItem(key);
                                setLocalStorageItems((prevItems) =>
                                  prevItems.filter((item) => item.key !== key),
                                );
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                          <ScrollArea className='h-[100px] mt-2 rounded border p-2 bg-muted/30'>
                            <pre className='text-xs'>{formatJSON(value)}</pre>
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      No localStorage items found
                    </div>
                  )}
                </TabsContent>
                <TabsContent value='sessionStorage' className='mt-4'>
                  {sessionStorageItems.length > 0 ? (
                    <div className='border rounded-lg divide-y'>
                      {sessionStorageItems.map(({ key, value }) => (
                        <div key={key} className='p-3'>
                          <div className='flex justify-between items-center'>
                            <code className='bg-muted px-2 py-1 rounded text-sm'>{key}</code>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                sessionStorage.removeItem(key);
                                setSessionStorageItems((prevItems) =>
                                  prevItems.filter((item) => item.key !== key),
                                );
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                          <ScrollArea className='h-[100px] mt-2 rounded border p-2 bg-muted/30'>
                            <pre className='text-xs'>{formatJSON(value)}</pre>
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      No sessionStorage items found
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Context Tab */}
        <TabsContent value='context' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Application Context</CardTitle>
              <CardDescription>
                View the current state of application context providers
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Tabs defaultValue='authContext'>
                <TabsList className='grid grid-cols-5'>
                  <TabsTrigger value='authContext'>Auth</TabsTrigger>
                  <TabsTrigger value='apiContext'>API</TabsTrigger>
                  <TabsTrigger value='projectFilesContext'>Projects</TabsTrigger>
                  <TabsTrigger value='inventoryContext'>Inventory</TabsTrigger>
                  <TabsTrigger value='invoicesContext'>Invoices</TabsTrigger>
                </TabsList>

                <TabsContent value='authContext' className='mt-4'>
                  <ScrollArea className='h-[300px] rounded border p-3 bg-muted/30'>
                    <pre className='text-xs'>
                      {safeStringify({
                        isAuthenticated,
                        user,
                        loading: false, // Just for display
                        error: null,
                      })}
                    </pre>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value='apiContext' className='mt-4'>
                  <ScrollArea className='h-[300px] rounded border p-3 bg-muted/30'>
                    <pre className='text-xs'>{safeStringify(apiContext)}</pre>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value='projectFilesContext' className='mt-4'>
                  <ScrollArea className='h-[300px] rounded border p-3 bg-muted/30'>
                    <pre className='text-xs'>{safeStringify(projectFilesContext)}</pre>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value='inventoryContext' className='mt-4'>
                  <ScrollArea className='h-[300px] rounded border p-3 bg-muted/30'>
                    <pre className='text-xs'>{safeStringify(inventoryContext)}</pre>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value='invoicesContext' className='mt-4'>
                  <ScrollArea className='h-[300px] rounded border p-3 bg-muted/30'>
                    <pre className='text-xs'>{safeStringify(invoicesContext)}</pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dev Settings Tab */}
        <TabsContent value='settings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Developer Settings</CardTitle>
              <CardDescription>Configure development environment settings</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Slow Network Simulation</h3>
                    <p className='text-sm text-gray-500'>
                      Add delay to API requests to simulate slow connections
                    </p>
                  </div>
                  <Switch
                    checked={devOptions.slowNetworkSimulation}
                    onCheckedChange={(checked) =>
                      handleDevOptionChange('slowNetworkSimulation', checked)
                    }
                  />
                </div>
                <Separator />

                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Force Error Responses</h3>
                    <p className='text-sm text-gray-500'>
                      Randomly trigger errors in API responses
                    </p>
                  </div>
                  <Switch
                    checked={devOptions.forceErrors}
                    onCheckedChange={(checked) => handleDevOptionChange('forceErrors', checked)}
                  />
                </div>
                <Separator />

                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Log API Calls</h3>
                    <p className='text-sm text-gray-500'>
                      Log all API calls to console for debugging
                    </p>
                  </div>
                  <Switch
                    checked={devOptions.logApiCalls}
                    onCheckedChange={(checked) => handleDevOptionChange('logApiCalls', checked)}
                  />
                </div>
                <Separator />

                <div className='pt-4'>
                  <h3 className='font-medium mb-3'>System Actions</h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <Button variant='outline' onClick={() => window.location.reload()}>
                      Refresh Application
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }}
                    >
                      Reset All Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className='mb-8'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Mock Data Controls</CardTitle>
            <CardDescription>Reset and manage mock data for testing</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleResetMockData} variant='outline'>
              Reset Mock Users & Data
            </Button>
            <p className='text-sm text-muted-foreground mt-2'>
              Resets mock users and clears other mock data
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='mb-8'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Context Inspector</CardTitle>
            <CardDescription>View the current state of application contexts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='auth'>
              <TabsList className='grid grid-cols-6 mb-4'>
                <TabsTrigger value='auth'>Auth</TabsTrigger>
                <TabsTrigger value='api'>API</TabsTrigger>
                <TabsTrigger value='projectFiles'>Files</TabsTrigger>
                <TabsTrigger value='inventory'>Inventory</TabsTrigger>
                <TabsTrigger value='invoices'>Invoices</TabsTrigger>
                <TabsTrigger value='templates'>Templates</TabsTrigger>
              </TabsList>

              <TabsContent value='auth' className='relative'>
                <div className='absolute top-2 right-2'>
                  <Badge variant='outline'>
                    {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </Badge>
                </div>
                <ScrollArea className='h-[400px] w-full'>
                  <pre className='bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto text-sm'>
                    {safeStringify(auth)}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value='api'>
                <ScrollArea className='h-[400px] w-full'>
                  <pre className='bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto text-sm'>
                    {safeStringify(apiContext)}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value='projectFiles'>
                <ScrollArea className='h-[400px] w-full'>
                  <pre className='bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto text-sm'>
                    {safeStringify(projectFilesContext)}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value='inventory'>
                <ScrollArea className='h-[400px] w-full'>
                  <pre className='bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto text-sm'>
                    {safeStringify(inventoryContext)}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value='invoices'>
                <ScrollArea className='h-[400px] w-full'>
                  <pre className='bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto text-sm'>
                    {safeStringify(invoicesContext)}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value='templates'>
                <ScrollArea className='h-[400px] w-full'>
                  <pre className='bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto text-sm'>
                    {safeStringify(templatesContext)}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
