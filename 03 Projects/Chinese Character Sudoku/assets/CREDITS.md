# Credits and licences for bundled files

- **Hanzi Writer** (`js/vendor/hanzi-writer.min.js`, v3.7.3): MIT licence, © 2014 David Chanin. Licence text: `js/vendor/LICENSE-hanzi-writer.txt`. https://hanziwriter.org
- **Stroke data** (`assets/strokes.json`): from `hanzi-writer-data` 2.0.1, which comes from Make Me a Hanzi, derived from Arphic Technology's fonts. Arphic Public License: `assets/ARPHICPL.TXT`. Only the 60 recently learned characters are included. Rebuild with `tools/build_strokes.py`.
- **Font** (`assets/fonts/wenkai-subset.woff2`): a subset of LXGW WenKai (霞鹜文楷) 1.7.0 from the `lxgw-wenkai-webfont` package, SIL Open Font License 1.1: `assets/fonts/OFL.txt`. The subset keeps only the characters this game uses. Rebuild with `tools/build_font.py`.

How the files were fetched: `npm pack hanzi-writer`, `npm pack hanzi-writer-data` and `npm pack lxgw-wenkai-webfont`, then the build tools in `tools/`.
