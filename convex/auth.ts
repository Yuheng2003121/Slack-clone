import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
// import {Password} from "@convex-dev/auth/providers/password";
import InputValidation from "./inputValidation";




export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  // providers: [GitHub, Password],
  providers: [GitHub, InputValidation],
});
