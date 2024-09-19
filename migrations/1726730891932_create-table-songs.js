/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("songs", {
    id: { type: "varchar(50)", primaryKey: true },
    title: { type: "text", notNull: true },
    year: { type: "integer", notNull: true },
    performer: { type: "text", notNull: true },
    genre: { type: "text", notNull: true },
    duration: { type: "integer" },
    album_id: {
      type: "varchar(50)",
      references: '"albums"',
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
  pgm.createIndex("songs", "album_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("songs", "album_id");
  pgm.dropTable("songs");
};
