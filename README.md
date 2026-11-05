# Antonio Varagnolo, personal site

Static site, no build step: About (`index.html`), Projects (`projects.html`), Publications (`publications.html`).

## Run it on your computer

    cd ~/Desktop/JobMarket/website
    python3 -m http.server 8765

Then open http://localhost:8765 in a browser. Stop the server with Ctrl+C.
(Opening `index.html` directly also works.)

## What is where

- **About:** research intro and portrait, News (LinkedIn posts), Background, Beyond research (facts and photo grid), Contact.
- **Projects:** hand-written. Each popup has a short version of the paper and a "Related publication" link.
- **Publications:** title, authors (your name in bold), abstract, and links to arXiv or the publisher.

## Updating News and Publications from LinkedIn

LinkedIn has no public feed for personal profiles, so the site cannot fetch posts live.
News items are plain HTML in `index.html` (section `#news`), and publications are `<article class="pub-entry">`
blocks in `publications.html`. To refresh, ask Claude to re-read your LinkedIn, or copy a block and edit it.

## Photos

Web-sized copies live in `assets/img/` (location and camera data removed). Originals stay in `pics_website/`,
which is excluded from git by `.gitignore`. Add a photo by saving a resized JPG in `assets/img/` and adding a
`<figure><img ...></figure>` line to the gallery in `index.html`.

## Project media

Each project popup has an animated GIF slot and a figure slot. Drop files into `assets/media/` named after the
project and they appear automatically (see `assets/media/README.txt`). Until then a dashed placeholder shows.

## Files

- `assets/style.css`: all styling
- `assets/projects.js`: popup behavior
- `assets/Antonio_Varagnolo_CV.pdf`: replace when the CV changes
