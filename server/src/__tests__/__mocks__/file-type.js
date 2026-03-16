module.exports = {
  fileTypeFromBuffer: jest.fn().mockResolvedValue({ mime: 'application/pdf', ext: 'pdf' })
}
