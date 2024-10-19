# tools-lukso-provider

Here is a small diagram to show how the client and providers (servers) talk to each other. The upProviderProxy needs pretty much 100% of the functionality the Parent upProvider needs because it also has the connectivity endpoints.

```mermaid
graph TD
    %% Define the main page and its upProviders
    subgraph Page["Page Universaleverything.io"]
        ClientUpPage["Client upProvider (Page, Optional)"]:::dashed
        ParentUp["Parent upProvider"]
        ClientUpPage --> ParentUp
        ParentUp -- Option A --> PageRootProvider["Page Root Provider (window.lukso)"]
        ParentUp -- Opion B --> PageEventSink["Local Parent EventSink"]

        %% Define the iframes as part of the page
        subgraph Iframe1["Grid Iframe 1"]
            ClientUp1["Client upProvider (Iframe 1)"]
        end

        subgraph Iframe2["Grid Iframe 2"]
            ClientUp2["Client upProvider (Iframe 2)"]
        end

        subgraph Iframe3["Grid Iframe 3"]
            ClientUp3["Client upProvider (Iframe 3)"]
        end
    end

    %% Relationships between iframes and Parent upProvider within the Page
    ClientUp1 -- Enable/Disable --> ParentUp
    ClientUp2 -- Enable/Disable --> ParentUp
    ClientUp3 -- Enable/Disable --> ParentUp

    %% External connections from Parent upProvider
    subgraph Popup["Embedded Wallet Popup"]
      RemoteParent -- Option A --> RootProvider["Root Provider (window.lukso)"]
      RemoteParent -- Opion B --> EventSink["Remote Parent EventSink"]
      ParentUp -- Option C --> RemoteParent["Remote Parent upProviderProxy"]

      %% Link styles for green (Option A) and red (Option B) connections
      linkStyle 1 stroke:green, stroke-width:2px;
      linkStyle 2 stroke:red, stroke-width:2px;
      linkStyle 8 stroke:blue, stroke-width:2px;
      linkStyle 6 stroke:green, stroke-width:2px;
      linkStyle 7 stroke:red, stroke-width:2px;

      %% Style for dashed nodes
      classDef dashed stroke-dasharray: 5 5;
    end
```

# sample path

```mermaid
sequenceDiagram
    participant Client as Client Event (Widget)
    participant ClientPort as Client Port (Widget)
    participant ServerPort as Server Port (Page)
    participant Server as Channel Event (Page)
    participant Channel as Channel Event Call (Page)

    %% Example Messages Between Lanes
    Client->>ClientPort: call accounts()
    ClientPort->>ServerPort: request eth_accounts
    ServerPort->>Server: request eth_accounts
    Server->>Channel: emit accountsChanged
    Server->>ServerPort: respond eth_accounts

    Channel->>Server: request allowAccounts
    Server->>ServerPort: request allowAccounts
    ServerPort->>ClientPort: response allowAccounts
    ClientPort->>Client: emit accountsChanged
```
