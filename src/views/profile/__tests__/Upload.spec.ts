import { fireEvent, render, waitFor } from "@testing-library/vue";
import ProfileUpload from "../Upload.vue";

const mockUploadUniversalProfileMetadata = jest.fn();

type Link = {
  title: string;
  url: string;
};

type MockMetaData = {
  name: string;
  description: string;
  links: Link[];
  tags: string[];
  profileImage: File;
  backgroundImage: File;
};

const mockData: MockMetaData = {
  name: "Test",
  description: "Test",
  links: [],
  tags: [],
  profileImage: new File([], "test.png"),
  backgroundImage: new File([], "test.png"),
};

jest.mock("@/compositions/useLspFactory", () => ({
  useLspFactory: () => ({
    uploadUniversalProfileMetaData: mockUploadUniversalProfileMetadata,
  }),
}));

describe("ProfileUpload", () => {
  test("can upload a profile", async () => {
    const { getByLabelText, getByTestId } = render(ProfileUpload);
    const nameInput = getByLabelText(/name/i);
    const descriptionInput = getByLabelText(/description/i);
    const uploadButton = getByTestId("upload-button");

    await fireEvent.update(nameInput, mockData.name);
    await fireEvent.update(descriptionInput, mockData.description);

    await fireEvent.click(uploadButton);

    await waitFor(async () => {
      expect(mockUploadUniversalProfileMetadata).toHaveBeenCalledTimes(1);
    });
  });
});
