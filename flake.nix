{
  description = "b.oui.moe — SolidStart + MDX + UnoCSS static blog (dev environment)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          # 与 CI (GitHub Actions, node 22) 保持一致
          nodejs = pkgs.nodejs_22;
          pnpm = pkgs.pnpm;
        in
        {
          default = pkgs.mkShell {
            name = "b.oui.moe-dev";

            packages = [
              nodejs
              pnpm
              pkgs.corepack
              pkgs.nixfmt
            ];

            shellHook = ''
              # pnpm 遵循 package.json 的 packageManager 字段（corepack）
              export COREPACK_HOME="''${COREPACK_HOME:-$HOME/.cache/node/corepack}"

              echo "node $(node --version) · pnpm $(pnpm --version)"
              echo "开发：pnpm dev   构建：pnpm build:all"
            '';
          };
        });

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt);
    };
}
