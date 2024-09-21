/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: { type: "varchar(50)", primaryKey: true },
    playlist_id: {
      type: "varchar(50)",
      references: '"playlists"',
      onDelete: "cascade",
    },
    song_id: {
      type: "varchar(50)",
      references: '"songs"',
      onDelete: "cascade",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
  pgm.createIndex("playlist_songs", "playlist_id");
  pgm.createIndex("playlist_songs", "song_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("playlist_songs", "playlist_id");
  pgm.dropIndex("playlist_songs", "song_id");
  pgm.dropTable("playlist_songs");
};
