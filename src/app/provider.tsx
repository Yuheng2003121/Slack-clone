import { ConvexClientProvider } from "@/components/provider/ConvexClientProvider";
import { JotaiProvider } from "@/components/provider/JotaiProvider";
import { ConvexAuthNextjsServerProvider,  } from "@convex-dev/auth/nextjs/server";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import React from "react";

export default function Provider({ children }: React.PropsWithChildren) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <NuqsAdapter>
          <JotaiProvider>{children}</JotaiProvider>
        </NuqsAdapter>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
