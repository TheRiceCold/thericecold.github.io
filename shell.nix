{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "bun-env";

  buildInputs = with pkgs; [ bun git ];

  shellHook = ''
    if [ ! -d "node_modules" ]; then
      echo "🚀 Installing dependencies..."
      bun install
      echo "✅ Dependencies installed!"
    fi

    echo "🍞 Bun version: $(bun --version)"
    echo "✨ Ready for development!"
  '';
}