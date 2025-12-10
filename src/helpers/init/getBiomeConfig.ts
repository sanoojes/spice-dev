export const getBiomeConfig = (version: string) => ({
  root: true,
  $schema: `https://biomejs.dev/schemas/${version}/schema.json`,
  vcs: {
    enabled: true,
    clientKind: "git",
    useIgnoreFile: true,
  },
  files: {
    ignoreUnknown: true,
    includes: ["**", "!node_modules", "!dist", "!build"],
  },
  formatter: {
    enabled: true,
    indentStyle: "space",
    indentWidth: 2,
  },
  linter: {
    enabled: true,
    rules: {
      recommended: true,
    },
    domains: {
      next: "recommended",
      react: "recommended",
    },
  },
  assist: {
    actions: {
      source: {
        organizeImports: "on",
      },
    },
  },
});
