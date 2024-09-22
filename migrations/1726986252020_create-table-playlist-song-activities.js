/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("playlist_song_activities", {
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
    user_id: {
      type: "varchar(50)",
      references: '"users"',
      onDelete: "cascade",
    },
    action: { type: "varchar(50)", notNull: true },
    time: { type: "timestamp", notNull: true },
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
  pgm.createIndex("playlist_song_activities", "playlist_id");
  pgm.createIndex("playlist_song_activities", "song_id");
  pgm.createIndex("playlist_song_activities", "user_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("playlist_song_activities", "playlist_id");
  pgm.dropIndex("playlist_song_activities", "song_id");
  pgm.dropIndex("playlist_song_activities", "user_id");
  pgm.dropTable("playlist_song_activities");
};
