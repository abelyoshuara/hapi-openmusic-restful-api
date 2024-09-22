const autoBind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayloadSchema(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist(name, owner);

    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler() {
    const playlists = await this._playlistsService.getPlaylists();
    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(owner, playlistId);
    await this._playlistsService.deletePlaylistById(playlistId);

    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    };
  }

  async postSongByPlaylistIdHandler(request, h) {
    try {
      this._validator.validatePostSongToPlaylistPayloadSchema(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: owner } = request.auth.credentials;

      await this._songsService.getSongById(songId);
      await this._playlistsService.verifyPlaylistAccess(owner, playlistId);

      const playlistSongId = await this._playlistsService.addSongToPlaylist(
        playlistId,
        songId,
      );

      await this._playlistsService.addPlaylistActivity({
        playlistId,
        songId,
        userId: owner,
        action: "add",
        time: new Date().toISOString(),
      });

      const response = h.response({
        status: "success",
        message: "Lagu berhasil ditambahkan ke dalam playlist",
        data: {
          playlistSongId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      return response;
    }
  }

  async getSongsByPlaylistIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(owner, playlistId);

    const playlist =
      await this._playlistsService.getSongsInPlaylist(playlistId);

    return {
      status: "success",
      data: {
        playlist,
      },
    };
  }

  async deleteSongByPlaylistIdHandler(request) {
    this._validator.validateDeleteSongToPlaylistPayloadSchema(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(owner, playlistId);

    await this._playlistsService.addPlaylistActivity({
      playlistId,
      songId,
      userId: owner,
      action: "delete",
      time: new Date().toISOString(),
    });

    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);

    return {
      status: "success",
      message: "Lagu berhasil dihapus",
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(owner, playlistId);
    const activities =
      await this._playlistsService.getPlaylistActivities(playlistId);

    return {
      status: "success",
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
