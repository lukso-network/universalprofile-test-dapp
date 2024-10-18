# tools-lukso-provider

Here is a small diagram to show how the client and providers (servers) talk to each other. The upProviderProxy needs pretty much 100% of the functionality the Parent upProvider needs because it also has the connectivity endpoints.
```mermaid
graph TD
    %% Define the main page and its upProviders
    subgraph Page["Page Universaleverything.io"]
        ClientUpPage["Client upProvider (Page)"]
        ParentUp["Parent upProvider"]
        ClientUpPage --> ParentUp
        ParentUp -- Option A --> PageRootProvider["Page Root Provider (window.lukso)"]
        ParentUp -- Opion B --> PageEventSink["Local Parent EventSink"]

        %% Define the iframes as part of the page
        subgraph Iframe1["Iframe 1"]
            ClientUp1["Client upProvider (Iframe 1)"]
        end
        
        subgraph Iframe2["Iframe 2"]
            ClientUp2["Client upProvider (Iframe 2)"]
        end

        subgraph Iframe3["Iframe 3"]
            ClientUp3["Client upProvider (Iframe 3)"]
        end
    end

    %% Relationships between iframes and Parent upProvider within the Page
    ClientUp1 --> ParentUp
    ClientUp2 --> ParentUp
    ClientUp3 --> ParentUp
    
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
    end
```
