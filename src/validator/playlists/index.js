const InvariantError = require("../../exceptions/InvariantError");
const {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  DeleteSongToPlaylistPayloadSchema,
} = require("./schema");

const PlaylistsValidator = {
  validatePostPlaylistPayloadSchema: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePostSongToPlaylistPayloadSchema: (payload) => {
    const validationResult = PostSongToPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateDeleteSongToPlaylistPayloadSchema: (payload) => {
    const validationResult =
      DeleteSongToPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
