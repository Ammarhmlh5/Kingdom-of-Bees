export const useCameraDevice = () => null;
export const usePhotoOutput = () => ({
  capturePhoto: async () => null,
  capturePhotoToFile: async () => ({ filePath: '' }),
  prepareSettings: async () => {},
  supportsDepthDataDelivery: false,
  supportsCameraCalibrationDataDelivery: false,
});
export const Camera = {
  Component: () => null,
};
export default Camera;
