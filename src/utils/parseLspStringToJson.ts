import type { LSP3Profile } from "@lukso/lsp-factory.js-alpha";

type LSP3ProfileJSONType = {
  json: {
    LSP3Profile: LSP3Profile;
  };
  url: string;
};

const parseLspStringToJson = (data: string): LSP3ProfileJSONType => {
  if (typeof data !== "string") {
    return data;
  }
  return JSON.parse(data);
};

export default parseLspStringToJson;
