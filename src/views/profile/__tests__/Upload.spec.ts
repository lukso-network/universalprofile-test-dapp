import { LSP3ProfileLink } from "@lukso/lsp-factory.js-alpha";
import { fireEvent, render, waitFor } from "@testing-library/vue";
import ProfileUpload from "../Upload.vue";

const mockUploadUniversalProfileMetadata = jest.fn();

jest.mock("@/compositions/useLspFactory", () => ({
  __esModule: true,
  default: () => ({
    uploadUniversalProfileMetadata: () => mockUploadUniversalProfileMetadata(),
  }),
}));

type MockMetaData = {
  name: string;
  description: string;
  links: LSP3ProfileLink[];
  tags: string[];
  profileImage: File;
  backgroundImage: File;
};

describe("ProfileUpload", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("can upload a profile", async () => {
    const mockData: MockMetaData = {
      name: "Test",
      description: "Test",
      links: [],
      tags: [],
      profileImage: new File([], "test.png"),
      backgroundImage: new File([], "test.png"),
    };
    mockUploadUniversalProfileMetadata.mockResolvedValue(mockData);

    const { getByTestId } = render(ProfileUpload);
    const uploadButton = getByTestId("upload-button");

    await fireEvent.click(uploadButton, {
      bubbles: true,
    });
    mockUploadUniversalProfileMetadata.mockReturnValue(mockData);
    waitFor(() => {
      expect(mockUploadUniversalProfileMetadata).toBeCalled();
    });
  });
});
