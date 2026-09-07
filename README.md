- archived contains all previous code, which was rushed, missing out on a lot of data i required and sorting DLC wrong
- rewrite in typescript at the same time as updating
- currently have everything working up to creating the new mod data classes on each row

# To-do

- [x] create the submitter and credit groups
- [x] add mod to player class if cleared
- [x] create mod class for each row, checking if it already has a mod data id
- [x] add mod downloads to Download class
- [x] add mod requirements
- [x] create SQL statements
- [ ] attempt to find existing players using the google forms response sheet and discord bot (maybe command to run on bot)
- [ ] get map names for each mod (likely after website's in use)
- [ ] figure out if there's a better way to store child mods

# Errors

- Sometimes the script will fail late in, being unable to transform reponse into json
