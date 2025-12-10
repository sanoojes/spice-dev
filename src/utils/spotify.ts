import spawn from "cross-spawn";

export function getSpotifyPath(): string {
  const result = spawn.sync("spicetify", ["config", "spotify_path"], {
    encoding: "utf8",
  });

  const stdout = (result.stdout ?? "").toString().trim();
  const stderr = (result.stderr ?? "").toString().trim();

  const failed =
    result.error ||
    (typeof result.status === "number" && result.status !== 0) ||
    !stdout;

  if (failed) {
    console.error("Failed to get Spotify path from spicetify.");
    if (result.error) {
      console.error(`Error: ${result.error.message}`);
    } else if (stderr) {
      console.error(stderr);
    }

    console.error("");
    console.error("Please configure spotify_path in spicetify, for example:");
    console.error("  spicetify config spotify_path /path/to/Spotify");
    console.error("");
    process.exit(1);
  }

  return stdout;
}
