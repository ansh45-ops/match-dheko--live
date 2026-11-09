MatchDekho Live — Static Website

FILES
- index.html : page structure
- style.css  : styles
- app.js     : page interactions and channel loading

DEPLOY TO VERCEL
1. Extract this ZIP.
2. Open https://vercel.com and sign in.
3. Choose Add New -> Project, then import a Git repository containing these files,
   OR use the Vercel CLI from this folder: `vercel` and follow the prompts.
4. No build command or output directory is required for this plain static site.
   If prompted for a framework, choose Other.

DEPLOY TO INFINITYFREE
1. Extract this ZIP.
2. Open the InfinityFree control panel -> File Manager.
3. Open the `htdocs` directory (sometimes shown as `public_html` by other hosts).
4. Upload index.html, style.css, and app.js directly into that web root.
5. Visit your domain over HTTPS.

NOTES
- Keep all three files in the same directory.
- The page loads HLS.js from cdnjs and the India channel playlist from iptv-org.
  Those external services must be reachable for their features to work.
- The existing embedded player URLs are third-party sources from the supplied HTML.
  Their availability, authorization, and embedding permissions are not verified.
  Use only streams you are authorized to distribute or embed.
- Some third-party pages may block iframe embedding or playback; hosting the page
  does not control those restrictions.


FIX UPDATE: index.html now loads style.css and app.js as separate files. The hero banner image is stored in assets/hero.jpg. Keep the assets folder when uploading. The online channel list has a fallback playlist source; external playlist availability and individual stream availability are not guaranteed.
