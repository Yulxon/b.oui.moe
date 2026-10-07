{
  description = "b.oui.moe — Data → Engine → Public static blog (dev environment)";

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
          # 与 CI (GitHub Actions, node 24) 保持一致
          nodejs = pkgs.nodejs_24;
        in
        {
          default = pkgs.mkShell {
            name = "b.oui.moe-dev";

            packages = [
              nodejs
              pkgs.nixfmt
            ];

            shellHook = ''
              echo "node $(node --version) · npm $(npm --version)"
              echo "开发：npm run dev   构建：npm run build"
            '';
          };
        });

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt);
    };
}
