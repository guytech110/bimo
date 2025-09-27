class BimoCli < Formula
  desc "bimo CLI"
  homepage "https://github.com/guytech110/bimo"
  url "https://registry.npmjs.org/bimo-cli/-/bimo-cli-1.0.0.tgz"
  sha256 "SKIP" # set by release automation
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir[libexec/"bin/*"]
  end

  test do
    system "#{bin}/bimo", "--version"
  end
end


