import { defu } from "defu";
import type { RouteLocationRaw } from "vue-router";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/vue";

export const typedClient = createAuthClient({
  plugins: [adminClient()],
});

export type Session = typeof typedClient.$Infer.Session.session;
export type User = typeof typedClient.$Infer.Session.user;

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string;
  redirectGuestTo: RouteLocationRaw | string;
}

export function useAuth() {
  const url = useRequestURL();
  const headers = import.meta.server ? useRequestHeaders() : undefined;

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers,
    },
    plugins: [adminClient()],
  });

  const options = defu(
    useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>,
    {
      redirectUserTo: "/",
      redirectGuestTo: "/login",
    },
  );
  const session = useState<Session | null>("auth:session", () => null);
  const user = useState<User | null>("auth:user", () => null);
  const sessionFetching = import.meta.server
    ? ref(false)
    : useState("auth:sessionFetching", () => false);

  const fetchSession = async () => {
    if (sessionFetching.value) {
      console.log("already fetching session");
      return;
    }
    sessionFetching.value = true;
    const { data } = await client.getSession({
      fetchOptions: {
        headers,
      },
    });
    session.value = data?.session || null;
    user.value = data?.user || null;
    sessionFetching.value = false;
    return data;
  };

  if (import.meta.client) {
    client.$store.listen("$sessionSignal", async (signal) => {
      if (!signal) return;
      await fetchSession();
    });
  }

  async function signOut() {
    const res = await client.signOut();
    session.value = null;
    user.value = null;
    loadTheme("guage");

    // Reset all stores
    const userSettingsStore = useUserSettingsStore();
    const globalSettingsStore = useGlobalSettingsStore();
    const syncStore = useSyncStore();
    const uiStore = useUiStore();
    userSettingsStore.$reset();
    globalSettingsStore.$reset();
    syncStore.$reset();
    uiStore.$reset();

    // Clear the cookies
    const storesToClear = [
      "skeleton.sync",
      "skeleton.globalSettings",
      "skeleton.ui",
    ];
    for (const store of storesToClear) {
      const cookie = useCookie(store);
      cookie.value = null;
    }

    await navigateTo("/login", { replace: true });

    return res;
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    admin: client.admin,
    isAdmin: computed(() => {
      if (!user.value) return false;
      return user.value.role === "admin" || user.value.role === "owner";
    }),
    changePassword: client.changePassword,
    changeEmail: client.changeEmail,
    signOut,
    options,
    fetchSession,
    client,
  };
}
