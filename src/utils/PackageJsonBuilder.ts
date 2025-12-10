export interface PackageJson {
  name?: string;
  version?: string;
  private?: boolean;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export type DepKind = "prod" | "dev" | "peer";

export class PackageJsonBuilder {
  constructor(private pkg: PackageJson = {}) {}

  get value(): PackageJson {
    return this.pkg;
  }

  setScript(name: string, command: string): this {
    this.pkg.scripts ??= {};
    this.pkg.scripts[name] = command;
    return this;
  }

  removeScript(name: string): this {
    if (!this.pkg.scripts) return this;
    delete this.pkg.scripts[name];
    return this;
  }

  private addDepInternal(kind: DepKind, name: string, version: string): this {
    const field =
      kind === "prod"
        ? "dependencies"
        : kind === "dev"
          ? "devDependencies"
          : "peerDependencies";

    this.pkg[field] ??= {};
    (this.pkg[field] as Record<string, string>)[name] = version;
    return this;
  }

  addDependency(name: string, version: string): this {
    return this.addDepInternal("prod", name, version);
  }

  addDevDependency(name: string, version: string): this {
    return this.addDepInternal("dev", name, version);
  }

  addPeerDependency(name: string, version: string): this {
    return this.addDepInternal("peer", name, version);
  }

  removeDependency(kind: DepKind, name: string): this {
    const field =
      kind === "prod"
        ? "dependencies"
        : kind === "dev"
          ? "devDependencies"
          : "peerDependencies";

    const section = this.pkg[field] as Record<string, string> | undefined;
    if (section) delete section[name];

    return this;
  }
}
