import { USER_TYPE } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Profile {
  name: string;
  email: string;
  avatar?: string;
  user_type: USER_TYPE;
  role: string;
}

interface IProfileStore {
  profile: Profile | null;
  token: string;

  setProfile: (profile: Profile | null) => void;
  setToken: (token: string) => void;
}

export const useProfileStore = create<IProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      token: "",

      setProfile: (profile: Profile | null) => set({ profile }),
      setToken: (token: string) => set({ token }),
    }),
    {
      name: "app-auth-store",
      partialize: (state) => ({ 
        profile: state.profile, 
        token: state.token 
      }),
    }
  )
);
