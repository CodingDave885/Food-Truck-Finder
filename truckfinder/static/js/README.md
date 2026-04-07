Author: Andre Nunes da Silva
Date: 04/07/26

JS File Struture 

-- Folder Layout --
static/js
- map.js
- routing.js
- functions
   - menu.js
   - calculator.js
   - location.js

------------------------------------------------------------------------

-- Adding a new JS File --
(for new features, etc)

1. if it's a helper function and or feature it can go into "static/js/functions/"
2. if it directly affecfts the map object or a large feature it can go into main parent folder (the one this file is in)

------------------------------------------------------------------------

-- Adding to Map.html (or any file) --

1. Load your file in with a script tag (ex : <script src="{{ url_for('static', filename='js/map.js') }}"></script> )
   - the tag opens with <script> and ends with </script> 
   - route the JS file with "url_for" then the parent folder name which is "static"
   - then depending if your filename is in "js/functions" or "js" just do it in accordance of the file structure so it doesn't mess anything up

2. Try to load script files that are more important than other ones, if we make like a review system which uses JS for something we want to put
   that above say the calculator.

------------------------------------------------------------------------

-- Basic House Rules --

Don't redeclare global variable names in new files, if you use "map" as a variable in another file it'll mess up a lot of things since it's being ran in the HTML file so all the variables get redeclared in there.


