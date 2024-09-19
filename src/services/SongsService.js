const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const { mapSongToModel } = require("../utils");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    performer,
    genre,
    duration = null,
    albumId = null,
  }) {
    const id = `song-${nanoid(16)}`;
    let columns = ["$1", "$2", "$3", "$4", "$5"];
    let values = [id, title, year, performer, genre];

    if (duration) {
      columns.push("$6");
      values.push(duration);
    }

    if (albumId) {
      columns.push("$7");
      values.push(albumId);
    }

    const query = {
      text: `INSERT INTO songs VALUES(${columns.join(", ")}) RETURNING id`,
      values,
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Song gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getSongs({ title = "", performer = "" }) {
    const conditions = [];
    const values = [];

    if (title) {
      conditions.push(`title ILIKE $${conditions.length + 1}`);
      values.push(`%${title}%`);
    }

    if (performer) {
      conditions.push(`performer ILIKE $${conditions.length + 1}`);
      values.push(`%${performer}%`);
    }

    const query = {
      text: `SELECT * FROM songs${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""}`,
      values,
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapSongToModel);
  }

  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Song tidak ditemukan");
    }

    return result.rows.map(mapSongToModel)[0];
  }

  async editSongById(
    id,
    { title, year, genre, performer, duration = null, albumId = null },
  ) {
    const updatedAt = new Date().toISOString();
    let columns = ["title = $1", "year = $2", "genre = $3", "performer = $4"];
    let values = [title, year, genre, performer];
    let index = 5;

    if (duration) {
      columns.push(`duration = $${index}`);
      values.push(duration);
      index++;
    }

    if (albumId) {
      columns.push(`album_id = $${index}`);
      values.push(albumId);
      index++;
    }

    columns.push(`updated_at = $${index}`);
    values.push(updatedAt);
    index++;

    const query = {
      text: `UPDATE songs SET ${columns.join(", ")} WHERE id = $${index} RETURNING id`,
      values: [...values, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui song. Id tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Song gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = SongsService;
