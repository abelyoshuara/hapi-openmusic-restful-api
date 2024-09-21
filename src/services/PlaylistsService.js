const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const AuthorizationError = require("../exceptions/AuthorizationError");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getPlaylists() {
    const query = `SELECT playlists.id, playlists.name, users.username
                  FROM playlists
                  LEFT JOIN users ON users.id = playlists.owner`;

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      username: row.username,
    }));
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan ke playlist");
    }

    return result.rows[0].id;
  }

  async getSongsInPlaylist(playlistId) {
    const query = {
      text: `SELECT 
              playlists.id, playlists.name, 
              users.username, 
              songs.id as song_id, songs.title, songs.performer
            FROM songs
            LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
            LEFT JOIN playlists ON playlist_songs.playlist_id = playlists.id
            LEFT JOIN users ON users.id = playlists.owner
            WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      username: result.rows[0].username,
      songs: result.rows
        .filter((row) => row.song_id !== null)
        .map((row) => ({
          id: row.song_id,
          title: row.title,
          performer: row.performer,
        })),
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(
        "Lagu gagal dihapus ke playlist. Id tidak ditemukan",
      );
    }
  }

  async verifyPlaylistOwner(owner, playlistId) {
    const query = {
      text: `SELECT * FROM playlists WHERE id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }
}

module.exports = PlaylistsService;
