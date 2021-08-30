import { gql } from "graphql-request";

export function getLSP3ProfileQuery(address: string): string {
  return gql`
    {
      LSP3UniversalProfiles(
        where: {
          address: { equals: "${address}" }
        }
      ) {
        address
        LSP1UniversalReceiverDelegate
        LSP3Profile {
          name
          description
          links
          tags
          profileImage
          backgroundImage
        }
        LSP3IssuedAssets
      }
    }
  `;
}
