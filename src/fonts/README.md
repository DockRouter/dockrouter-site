# Local variable fonts

Space Grotesk (300–700) is the default UI font; JetBrains Mono (100–800) is used for code and technical values. Both include Turkish Latin characters. Quicksand has a reserved CSS token but is neither loaded nor used without a defined emphasis role.

The full variable TTF files come from the Google Fonts repository, converted losslessly to WOFF2 with FontTools 4.66.1/Brotli. Runtime and builds use these checked-in assets through `next/font/local`, with generated fallback metrics and stable CSS variables. CSS never depends on Next.js generated class names. The outlined DockRouter SVG wordmark is an independent brand asset.

- [Space Grotesk source](https://github.com/google/fonts/blob/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf), source blob `a1b2e6c26093066510a31147e7aec9abdc8d6c5e`.
- [JetBrains Mono source](https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf), source blob `aa310be8b717fe3774f9444dd89d5f4101cc6d10`.

SIL Open Font License notices are in `public/licenses/space-grotesk.txt` and `public/licenses/jetbrains-mono.txt`.
