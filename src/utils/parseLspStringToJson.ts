import { LSP3ProfileJSON } from "@lukso/lsp-factory.js";

type LSP3ProfileJSONType = {
  json: LSP3ProfileJSON;
  url: string;
};

const parseLspStringToJson = (data: string): LSP3ProfileJSONType => {
  if (typeof data !== "string") {
    return data;
  }
  return JSON.parse(data);
};

export default parseLspStringToJson;
