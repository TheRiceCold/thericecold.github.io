{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "bun-env";

  buildInputs = with pkgs; [ bun git ];

  shellHook = ''
    echo "🚀 Bun development environment ready!"
    echo "bun version: $(bun --version)"
  '';
}

