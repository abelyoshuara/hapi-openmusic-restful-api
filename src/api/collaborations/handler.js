const autoBind = require("auto-bind");

class CollaborationsHandler {
  constructor(
    collaborationsService,
    playlistsService,
    usersService,
    validator,
  ) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validatePostCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._usersService.getUserById(userId);
    await this._playlistsService.verifyPlaylistOwner(owner, playlistId);

    const collaborationId = await this._collaborationsService.addCollaboration(
      playlistId,
      userId,
    );

    const response = h.response({
      status: "success",
      message: "Kolaborasi berhasil ditambahkan",
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateDeleteCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(owner, playlistId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: "success",
      message: "Kolaborasi berhasil dihapus",
    };
  }
}

module.exports = CollaborationsHandler;
