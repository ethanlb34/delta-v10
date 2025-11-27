const CDN_BASE_URL = "https://cdn.jsdelivr.net/gh/ethanlb34/Delta-Games@main/";

const GAMES_PER_PAGE = 30;
let currentPage = 1;
let currentFilteredGames = [];

let lastLaunchedGame = { link: null, name: null }; 

const MOCK_GAMES = [
{ name: "UGS Library", path: "gamelibrary.html", type: "Action", image: "gamelibrary.png" },
{ name: "10 Minutes Till Dawn", path: "cl10minutestildawn.html", type: "Action", image: "cl10minutestildawn.png" },
{ name: "1v1 LOL", path: "cl1v1lol.html", type: "Action", image: "cl1v1lol.png" },
{ name: "2048 Puzzle", path: "cl2048.html", type: "Puzzle", image: "cl2048.png" },
{ name: "Achilles 2", path: "clachillies2.html", type: "Action", image: "clachillies2.png" },
{ name: "Age of War", path: "clageofwar.html", type: "Strategy", image: "clageofwar.png" }, // Added
{ name: "Age of War 2", path: "clageofwar2.html", type: "Strategy", image: "clageofwar2.png" }, // Added
{ name: "Agarilite", path: "clagariolite.html", type: "IO", image: "clagariolite.png" },
{ name: "Ages of Conflict", path: "clagesofconflict.html", type: "Strategy", image: "clagesofconflict.png" },
{ name: "Amigo Pancho", path: "clamigopancho.html", type: "Puzzle", image: "clamigopancho.png" }, // Added
{ name: "Amigo Pancho 2", path: "clamigopancho2.html", type: "Puzzle", image: "clamigopancho2.png" }, // Added
{ name: "Amigo Pancho 3", path: "clamigopancho3.html", type: "Puzzle", image: "clamigopancho3.png" }, // Added
{ name: "Amigo Pancho 4", path: "clamigopancho4.html", type: "Puzzle", image: "clamigopancho4.png" }, // Added
{ name: "Amigo Pancho 5", path: "clamigopancho5.html", type: "Puzzle", image: "clamigopancho5.png" }, // Added
{ name: "Amigo Pancho 6", path: "clamigopancho6.html", type: "Puzzle", image: "clamigopancho6.png" }, // Added
{ name: "Amigo Pancho 7", path: "clamigopancho7.html", type: "Puzzle", image: "clamigopancho7.png" }, // Added
{ name: "Angry Birds", path: "clangrybirds.html", type: "Physics", image: "clangrybirds.png" },
{ name: "Apple Shooter", path: "clappleshooter.html", type: "Action", image: "clappleshooter.png" },
{ name: "Bad Piggies", path: "clbadpiggies.html", type: "Physics", image: "clbadpiggies.jpg" },
{ name: "Baldi's Basics", path: "clbaldisbasics.html", type: "Horror", image: "clbaldisbasics.png" },
{ name: "Remaster Baldi's Basics ", path: "clbaldisbasicsremaster.html", type: "Horror", image: "clbaldisbasicsremaster.png" },
{ name: "Bank Robbery 2", path: "clbankrobbery2.html", type: "Action", image: "clbankrobbery2.png" },
{ name: "Basket Random", path: "clbasketrandom.html", type: "Sports", image: "clbasketrandom.png" },
{ name: "Bacon May Die", path: "clbaconmaydie.html", type: "Action", image: "clbaconmaydie.png" },
{ name: "Baseball Bros", path: "clbaseballbros.html", type: "Sports", image: "clbaseballbros.png" },
{ name: "Backyard Baseball", path: "clbackyardbaseball.html", type: "Sports", image: "clbackyardbaseball.png" },
{ name: "Backyard Baseball 9", path: "clbackyardbaseball09.html", type: "Sports", image: "clbackyardbaseball09.png" },
{ name: "Backyard Baseball 10", path: "clbackyardbaseball10.html", type: "Sports", image: "clbackyardbaseball10.png" },
{ name: "League Baseball", path: "clKenGriffeyJrPresentsMajorLeagueBaseball.html", type: "Sports", image: "clKenGriffeyJrPresentsMajorLeagueBaseball.png" },
{ name: "Bloons TD 4", path: "clbloonsTD4.html", type: "Tower Defense", image: "clbloonsTD4.png" },
{ name: "Burrito Bison Launcha Libre", path: "clburritobisonlaunchalibre.html", type: "Action", image: "clburritobisonlaunchalibre.png" },
{ name: "Basketball Legends", path: "clbballlegend.html", type: "Sports", image: "clbballlegend.png" },
{ name: "Basketball Stars", path: "clbasketballstars.html", type: "Sports", image: "clbasketballstars.png" },
{ name: "Basketball Bros", path: "clbasketbros.html", type: "Sports", image: "clbasketbros.png" },
{ name: "Battle Simulator", path: "clbattlesim.html", type: "Strategy", image: "clbattlesim.jpg" },
{ name: "BitLife", path: "clbitlife.html", type: "Life Sim", image: "clbitlife.png" },
{ name: "Blackjack", path: "clblackjack.html", type: "Card Game", image: "clblackjack.png" },
{ name: "Block Blast", path: "clblockblast.html", type: "Puzzle", image: "clblockblast.png" },
{ name: "Bloons TD 5", path: "clbloonsTD5.html", type: "Tower Defense", image: "clbloonsTD5.jpg" },
{ name: "Bob The Robber 5", path: "clbobtherobber5.html", type: "Stealth", image: "clbobtherobber5.png" },
{ name: "Bottle Jump 3D", path: "clbottlejump3d.html", type: "Arcade", image: "clbottlejump3d.jpg" },
{ name: "Call of Duty 4 (COD4)", path: "clcod4.html", type: "Shooter", image: "clcod4.png" },
{ name: "Call of Duty: Black Ops", path: "clcodblackops.html", type: "Shooter", image: "clcodblackops.png" }, // Added
{ name: "Car King Arena", path: "clcarkingarena.html", type: "Racing", image: "clcarkingarena.png" },
{ name: "Checkers", path: "clcheckers.html", type: "Board Game", image: "clcheckers.png" },
{ name: "Chess", path: "clchess.html", type: "Board Game", image: "clchess.png" },
{ name: "Clash Royale", path: "clclashofvikings.html", type: "Strategy", image: "clclashofvikings.png" },
{ name: "Cluster Rush", path: "clclusterrush.html", type: "Arcade", image: "clclusterrush.jpg" },
{ name: "Cod Zombies", path: "codzombies.html", type: "Shooter", image: "codzombies.png" },
{ name: "Cookie Clicker", path: "clcookieclickercool.html", type: "Clicker", image: "clcookieclickercool.png" },
{ name: "Cooking Mama 3", path: "clcookingmama3.html", type: "Simulation", image: "clcookingmama3.png" },
{ name: "Core Ball", path: "clcoreball.html", type: "Arcade", image: "clcoreball.png" },
{ name: "Command Strike", path: "clcommandstrike.html", type: "Shooter", image: "clcommandstrike.png" },
{ name: "Counter-Strike 1.6", path: "clcs1.6.html", type: "Shooter", image: "clcs1.6.jpg" },
{ name: "Crazy Cattle 3D", path: "clcrazycattle3d.html", type: "Simulation", image: "clcrazycattle3d.png" },
{ name: "Crazy Chicken 3D", path: "clcrazychicken3D.html", type: "Simulation", image: "clcrazychicken3D.png" },
{ name: "Crossy Road", path: "clcrossyroad.html", type: "Arcade", image: "clcrossyroad.png" },
{ name: "Curve Ball", path: "clcurveball.html", type: "Arcade", image: "clcurveball.png" },
{ name: "Dig to China", path: "cldigtochina.html", type: "Arcade", image: "cldigtochina.jpg" },
{ name: "Doge Miner", path: "cldogeminer.html", type: "Clicker", image: "cldogeminer.png" },
{ name: "Doge Miner 2", path: "cldogeminer2.html", type: "Clicker", image: "cldogeminer2.png" },
{ name: "Doom ZIO", path: "cldoomzio.html", type: "IO", image: "cldoomzio.png" },
{ name: "Draw Climber", path: "cldrawclimber.html", type: "Puzzle", image: "cldrawclimber.png" },
{ name: "Drift Hunters", path: "cldrifthuntersmerge.html", type: "Puzzle", image: "cldrifthuntersmerge.png" },
{ name: "Drift Boss", path: "cldriftboss.html", type: "Racing", image: "cldriftboss.png" },
{ name: "Drive Mad", path: "cldrivemad.html", type: "Racing", image: "cldrivemad.jpg" },
{ name: "Duck Life", path: "clducklife.html", type: "Arcade", image: "clducklife.png" },
{ name: "Duck Life 2", path: "clducklife2.html", type: "Arcade", image: "clducklife2.png" },
{ name: "Duck Life 3", path: "clducklife3.html", type: "Arcade", image: "clducklife3.png" },
{ name: "Duck Life 4", path: "clducklife4.html", type: "Arcade", image: "clducklife4.png" },
{ name: "Duck Life 5", path: "clducklfe5.html", type: "Arcade", image: "clducklfe5.png" },
{ name: "Deltarune", path: "cldeltarune.html", type: "RPG", image: "cldeltarune.png" },
{ name: "Doom DOS", path: "cldoomdos.html", type: "Shooter", image: "cldoomdos.png" },
{ name: "Escape Road", path: "clescaperoad.html", type: "Racing", image: "clescaperoad.png" },
{ name: "Escape Road 2", path: "clescaperoad2.html", type: "Racing", image: "clescaperoad2.png" },
{ name: "Feed Us 5", path: "clfeedus5.html", type: "Action", image: "clfeedus5.png" },
{ name: "FIFA 07", path: "clFIFA07.html", type: "Sports", image: "clFIFA07.png" },
{ name: "FIFA 99", path: "clFIFA99.html", type: "Sports", image: "clFIFA99.png" },
{ name: "FIFA Intl Soccer", path: "clFIFAinternationalsoccer.html", type: "Sports", image: "clFIFAinternationalsoccer.png" },
{ name: "Fireboy and Watergirl", path: "clfireboyandwatergirl.html", type: "Platformer", image: "clfireboyandwatergirl.png" },
{ name: "Fireboy and Watergirl 2", path: "clfireboyandwatergirl2.html", type: "Platformer", image: "clfireboyandwatergirl2.png" }, // Added
{ name: "Fireboy and Watergirl 3", path: "clfireboyandwatergirl3.html", type: "Platformer", image: "clfireboyandwatergirl3.png" }, // Added
{ name: "Fireboy and Watergirl 5", path: "clfireboyandwatergirl5.html", type: "Platformer", image: "clfireboyandwatergirl5.png" }, // Added
{ name: "Fireboy and Watergirl 6", path: "clfireboyandwatergirl6.html", type: "Platformer", image: "clfireboyandwatergirl6.png" }, // Added
{ name: "Flood Runner 4", path: "clfloodrunner4.html", type: "Runner", image: "clfloodrunner4.png" },
{ name: "Fluidism", path: "clfluidism.html", type: "Simulation", image: "clfluidism.png" },
{ name: "FNF", path: "clfridaynightfunkin.html", type: "Rhythm", image: "clfridaynightfunkin.jpg"},
{ name: "FNF Agoti", path: "clfnfagoti.html", type: "Rhythm", image: "clfnfagoti.png" },
{ name: "FNF B-Side", path: "clfnfbside.html", type: "Rhythm", image: "clfnfbside.png" },
{ name: "FNF FNAF 3", path: "clfnffnaf3.html", type: "Rhythm", image: "clfnffnaf3.png" },
{ name: "FNF Imposter V4", path: "clfnfimposterv4.html", type: "Rhythm", image: "clfnfimposterv4.png" },
{ name: "FNF Indie Cross", path: "clfnfindiecross.html", type: "Rhythm", image: "clfnfindiecross.png" },
{ name: "FNF Mario", path: "clmariomadness.html", type: "Classic", image: "clmariomadness.png" },
{ name: "FNF Shaggy", path: "clshaggy.html", type: "Racing", image: "clshaggy.png" },
{ name: "FNF Shaggy (Easy)", path: "clfnfshaggy4keys.html", type: "Racing", image: "clfnfshaggy4keys.png" },
{ name: "FNF Shaggy X Matt", path: "clfnfshaggyxmatt.html", type: "Rhythm", image: "clfnfshaggyxmatt.png" },
{ name: "FNF Sonic.exe", path: "clfnfsonicexe4.html", type: "Racing", image: "clfnfsonicexe4.jpg" },
{ name: "FNF Tricky", path: "clfnftricky.html", type: "Racing", image: "clfnftricky.png" },
{ name: "FNF Whitty", path: "clfnfwhitty.html", type: "Racing", image: "clfnfwhitty.png" },
{ name: "FNF Zardy", path: "clfnfzardy.html", type: "Racing", image: "clfnfzardy.png" },
{ name: "FNAF 1", path: "clFNAF.html", type: "Horror", image: "clFNAF.jpg" },
{ name: "FNAF 2", path: "clFNAF2.html", type: "Horror", image: "clFNAF2.png" },
{ name: "FNAF 3", path: "clFNAF3.html", type: "Horror", image: "clFNAF3.png" },
{ name: "FNAF 4", path: "clFNAF4.html", type: "Horror", image: "clFNAF4.png" },
{ name: "Football Bros", path: "clfootballbros.html", type: "Sports", image: "clfootballbros.png" },
{ name: "Football Legends", path: "clfootballlegends.html", type: "Sports", image: "clfootballlegends.png" },
{ name: "Fallout", path: "clfallout.html", type: "RPG", image: "clfallout.png" },
{ name: "Fruit Ninja", path: "clfruitninja.html", type: "Arcade", image: "clfruitninja.png" },
{ name: "Geometry Arrow", path: "geometryarrow.html", type: "Rhythm", image: "geometryarrow.jpg" },
{ name: "Geometry Dash", path: "clgeometrydashscratch.html", type: "Rhythm", image: "clgeometrydashscratch.png" },
{ name: "Getaway Shootout", path: "clgetawayshootout.html", type: "Shooter", image: "clgetawayshootout.png" },
{ name: "Granny", path: "granny.html", type: "Horror", image: "granny.jpg" },
{ name: "GTA Advance", path: "clgrandtheftautoadvance.html", type: "Action", image: "clgtaadv.png" },
{ name: "GTA (Classic)", path: "clgta22.html", type: "Action", image: "clgta22.png" },
{ name: "Gun Mayhem 2", path: "clgunmayhem2.html", type: "Shooter", image: "clgunmayhem2.png" }, 
{ name: "Gunspin", path: "clgunspin.html", type: "Action", image: "clgunspin.png" }, 
{ name: "Half-Life", path: "clhalflife.html", type: "Shooter", image: "clhalflife.png" },
{ name: "House Of Hazards", path: "clhouseofhazards.html", type: "Shooter", image: "clhouseofhazards.png" },
{ name: "Happy Wheels", path: "clhappywheels.html", type: "Physics", image: "clhappywheels.jpg" },
{ name: "Harvest.io", path: "clharvestio.html", type: "IO", image: "clharvestio.png" },
{ name: "Heist", path: "clhei$t.html", type: "Action", image: "clheist.png" },
{ name: "Helix Jump", path: "clhelixjump.html", type: "Arcade", image: "clheilxjump.png" },
{ name: "Hide N Seek", path: "clhidenseek.html", type: "Action", image: "clhidenseek.png" },
{ name: "Hole.io", path: "clholeio.html", type: "IO", image: "clholeio.png" },
{ name: "Idle Miner Tycoon", path: "clidleminertycoon.html", type: "Clicker", image: "clidleminertycoon.png" },
{ name: "Infinite Craft", path: "clinfinitecraft.html", type: "Puzzle", image: "clinfinitecraft.png" },
{ name: "Islander", path: "clislander.html", type: "Survival", image: "clislander.jpg" },
{ name: "Just Fall LOL", path: "cljustfalllol.html", type: "Platformer", image: "cljustfalllol.jpg" },
{ name: "Learn to Fly 3", path: "cllearntofly3.html", type: "Physics", image: "cllearntofly3.png" },
{ name: "Lode Runner", path: "clloderunner.html", type: "Classic", image: "clloderunner.png" },
{ name: "Madden 98", path: "clmadden98.html", type: "Sports", image: "clmadden98.png" },
{ name: "Madness Combat Defense", path: "clmadnesscombatdefense.html", type: "Tower Defense", image: "clmadnesscombatdefense.png" },
{ name: "Madness Combat FPS", path: "madnesscombatfps.html", type: "Shooter", image: "madnesscombatfps.jpg" },
{ name: "Mega Man 7", path: "clmegaman7.html", type: "Classic", image: "clmegaman7.png" },
{ name: "Melon Playground", path: "clmelonplayground.html", type: "Sandbox", image: "clmelonplayground.jpg" },
{ name: "Mighty Knight 2", path: "clmightyknight2.html", type: "RPG", image: "clmightyknight2.png" },
{ name: "Minecraft", path: "clminecraft1-8-8.html", type: "Sandbox", image: "clminecraft1-8-8.png" },
{ name: "Mortal Kombat 2", path: "clmortalkombat2.html", type: "Fighting", image: "clmortalkombat2.png" },
{ name: "Mortal Kombat 3", path: "clmortalkombat3.html", type: "Fighting", image: "clmortalkombat3.png" }, // Added
{ name: "Moto Road Rash 3D 2", path: "motoroadrash3d2.html", type: "Racing", image: "motoroadrash3d2.png" },
{ name: "Moto X3M", path: "clmotox3mm.html", type: "Racing", image: "clmotox3mm.png" },
{ name: "Monkey Mart", path: "clmonkeymart.html", type: "Simulation", image: "clmonkeymart.png" },
{ name: "Mountain Bike Racer", path: "clmountainbikeracer.html", type: "Racing", image: "clmountainbikeracer.png" },
{ name: "NBA Jam", path: "clnbajam.html", type: "Sports", image: "clnbajam.png" }, // Added
{ name: "Not Your Pawn", path: "clnotyourpawn.html", type: "Strategy", image: "clnotyourpawn.png" },
{ name: "Nugget Clicker", path: "clomeganuggetclicker.html", type: "Rhythm", image: "clomeganuggetclicker.png" },
{ name: "Only Up!", path: "clonlyup.html", type: "Platformer", image: "clonlyup.jpg" },
{ name: "OSU!", path: "closu.html", type: "Rhythm", image: "closu.jpg" },
{ name: "OVO", path: "clovofixed.html", type: "Platformer", image: "clovofixed.png" },
{ name: "Pokemon Emerald", path: "clpokemonemerald.html", type: "Classic", image: "clpokemonemerald.png" },
{ name: "Pac-Man", path: "clpacman.html", type: "Classic", image: "clpacman.jpg" },
{ name: "Papa's Freezeria", path: "clpapasfreezeria.html", type: "Simulation", image: "clpapasfreezeria.png" },
{ name: "Paper.io", path: "clpaperio.html", type: "IO", image: "clpaperio.png" },
{ name: "Paper.io 3D", path: "clpaperio3d.html", type: "IO", image: "clpaperio3d.png" },
{ name: "Parking Rush", path: "clparkingrush.html", type: "Puzzle", image: "clparkingrush.png" },
{ name: "Pokemon Fire Red", path: "clpokemonfirered.html", type: "Classic", image: "clpokemonfirered.png" },
{ name: "Polytrack Work Snow", path: "clpolytrackworksnow.html", type: "Simulation", image: "clpolytrackworksnow.png" },
{ name: "Push Your Luck", path: "clpushyourluck.html", type: "Arcade", image: "clpushyourluck.png" },
{ name: "Quake 3", path: "clquake3.html", type: "Shooter", image: "clquake3.png" },
{ name: "Raft Wars 2", path: "clraftwars2.html", type: "Action", image: "clraftwars2.jpg" },
{ name: "Ragdoll Archers", path: "clragdollarchers.html", type: "Action", image: "clragdollarchers.png" },
{ name: "Ragdoll.io", path: "clragdollio.html", type: "IO", image: "clragdollio.png" },
{ name: "Retro Bowl", path: "clretrobowl.html", type: "Sports", image: "clretrobowl.png" },
{ name: "Retro Ping Pong", path: "clretropingpong.html", type: "Classic", image: "clretropingpong.jpg" },
{ name: "Roblox (not real)", path: "cldoblox.html", type: "Sandbox", image: "cldoblox.png" },
{ name: "Rocket League", path: "clrocketleague.html", type: "Sports", image: "clrocketleague.png" },
{ name: "Rocket Soccer Derby", path: "clrocketsoccerderby.html", type: "Sports", image: "clrocketsoccerderby.png" },
{ name: "Rooftop Snipers", path: "clrooftopsnipers.html", type: "Shooter", image: "clrooftopsnipers.png" },
{ name: "Rooftop Snipers 2", path: "clrooftopsnipers2.html", type: "Shooter", image: "clrooftopsnipers2.png" },
{ name: "Run 3", path: "clrun3.html", type: "Runner", image: "clrun3.png" },
{ name: "Sandboxels", path: "clsandboxels.html", type: "Sandbox", image: "clsandboxels.png" },
{ name: "Sandtris", path: "clsandtris.html", type: "Puzzle", image: "clsandtris.png" },
{ name: "Sentry Fortress", path: "clsentryfortress.html", type: "Tower Defense", image: "clsentryfortress.jpg" },
{ name: "Slipways", path: "clslipways.html", type: "Strategy", image: "clslipways.jpg" },
{ name: "Slither.io", path: "clslitherio.html", type: "IO", image: "clslitherio.png" },
{ name: "Slope", path: "clslope3.html", type: "Runner", image: "clslope3.png" },
{ name: "Slope 2 Player", path: "clslope2player.html", type: "Runner", image: "clslope2player.png" },
{ name: "Slow Roads", path: "clslowroad.html", type: "Simulation", image: "clslowroads.png" },
{ name: "Small World Cup", path: "clasmallworldcup.html", type: "Sports", image: "clasmallworldcup.png" }, // Moved here
{ name: "Sniper Shot", path: "clsnipershot.html", type: "Shooter", image: "clsnipershot.png" },
{ name: "Super Cold", path: "clsupercold.html", type: "Shooter", image: "clsupercold.png" },
{ name: "Super Hot", path: "clsuperhot.html", type: "Shooter", image: "clsuperhot.png" },
{ name: "2D Super Hot", path: "clsuperhotlinemiami.html", type: "Shooter", image: "clsuperhotlinemiami.png" },
{ name: "Snow Rider", path: "clsnowrider.html", type: "Racing", image: "clsnowrider.png" },
{ name: "Soccer Bros", path: "clsoccerbros.html", type: "Sports", image: "clsoccerbros.png" },
{ name: "Soccer Random", path: "clsoccerrandomgood.html", type: "Sports", image: "clsoccerrandomgood.png" },
{ name: "Solar Smash", path: "clsolarsmash.html", type: "Simulation", image: "clsolarsmash.jpg" },
{ name: "Solitaire", path: "clsolitaire.html", type: "Card Game", image: "clsolitaire.png" },
{ name: "Sonic the Hedgehog 3", path: "clsonicthehedgehog3.html", type: "Classic", image: "clsonicthehedgehog3.png" },
{ name: "Sprunki", path: "clsprunki.html", type: "Arcade", image: "clsprunki.jpg" },
{ name: "Stack Tris", path: "clstacktris.html", type: "Puzzle", image: "clstacktris.png" },
{ name: "State.io", path: "clstateio.html", type: "IO", image: "clstateio.png" },
{ name: "Steal A Brainrot.", path: "clsupitdept.html", type: "Simulation", image: "clsupitdept.png" },
{ name: "Stick War 2", path: "clstickwar2.html", type: "Strategy", image: "clstickwar2.png" },
{ name: "Stickman Hook", path: "clstickmanhook.html", type: "Platformer", image: "clstickmanhook.jpg" },
{ name: "Storm The House 3", path: "clstormthehouse3.html", type: "Shooter", image: "clstormthehouse3.jpg" },
{ name: "Street Fighter 2", path: "clstreetfighter2.html", type: "Fighting", image: "clstreetfighter2.png" },
{ name: "Strike Force Heroes 3", path: "clstrikeforceheroes3.html", type: "Shooter", image: "clstrikeforceheroes3.jpg" },
{ name: "Subway Surfers", path: "clsubwaysurfersmiami.html", type: "Runner", image: "clsubwaysurfersmiami.png" },
{ name: "Super Bomberman 2", path: "clsuperbomberman2.html", type: "Classic", image: "clsuperbomberman2.jpg" },
{ name: "Super Mario Bros. 3", path: "clmario3.html", type: "Classic", image: "clmario3.jpg" },
{ name: "Super Mario Kart", path: "clsupermariokart.html", type: "Racing", image: "clsupermariokart.jpg" },
{ name: "Survival Race", path: "clsurvivalracev2.html", type: "Simulation", image: "clsurvivalracev2.png" },
{ name: "Survival Race V2", path: "clsurvivalracev2.html", type: "Racing", image: "clsurvivalracev2.jpg" },
{ name: "Table Tanks", path: "cltabletanks.html", type: "Shooter", image: "cltabletanks.png" },
{ name: "Telephone Trouble", path: "cltelephonetrouble.html", type: "Puzzle", image: "cltelephonetrouble.png" },
{ name: "Temple Run 2", path: "cltemplerun2.html", type: "Runner", image: "cltemplerun2.png" },
{ name: "Territorial.io", path: "clterritorialio.html", type: "IO", image: "clterritorialio.jpg" },
{ name: "Tetris", path: "cltetris.html", type: "Puzzle", image: "cltetris.jpg" },
{ name: "The Backrooms", path: "clbackrooms.html", type: "Horror", image: "clbackrooms.png" },
{ name: "The Classroom", path: "cltheclassroom.html", type: "Horror", image: "cltheclassroom.png" },
{ name: "Time Shooter 3", path: "cltimeshooter3.html", type: "Shooter", image: "cltimeshooter3.png" },
{ name: "Tomb Of The Mask", path: "cltotm.html", type: "Action", image: "cltotm.png" },
{ name: "Tower Blocks", path: "cltowerblocks.html", type: "Physics", image: "cltowerblocks.png" },
{ name: "Truck Simulator", path: "cltrucksim.html", type: "Simulation", image: "cltrucksim.png" },
{ name: "Vex", path: "clvex.html", type: "Platformer", image: "clvex.png" },
{ name: "Unicycle Hero", path: "clunicyclehero.html", type: "Platformer", image: "clunicyclehero.png" },
{ name: "Vex 2", path: "clvex2.html", type: "Platformer", image: "clvex2.png" },
{ name: "Vex 3", path: "clvex3.html", type: "Platformer", image: "clvex3.png" },
{ name: "Vex 4", path: "clvex4.html", type: "Platformer", image: "clvex4.png" },
{ name: "Vex 5", path: "clvex5.html", type: "Platformer", image: "clvex5.png" },
{ name: "Vex 6", path: "clvex6.html", type: "Platformer", image: "clvex6.png" },
{ name: "Vex 7", path: "clvex7.html", type: "Platformer", image: "clvex7.png" },
{ name: "Vex 8", path: "clvex8.html", type: "Platformer", image: "clvex8.png" },
{ name: "Volley Random", path: "clvolleyrandom.html", type: "Sports", image: "clvolleyrandom.png" },
{ name: "Wave Road 3D", path: "clwaveroad3d.html", type: "Platformer", image: "clwaveroad3d.png" },
{ name: "We Become What We Behold", path: "clwebecomewhatwebehold.html", type: "Indie", image: "clwbwwb.png" },
{ name: "World Cup 98", path: "clworldcup98.html", type: "Sports", image: "clworldcup98.png" },
];

/**
 * Retrieves the image URL for a given game path.
 * @param {string} path - The path to the game HTML file.
 * @returns {string} The full image URL.
 */
function getGameImage(path) {
    const game = MOCK_GAMES.find(g => g.path === path);
    if (!game || !game.image) return '';

    let imageUrl;
    if (game.image.startsWith('http')) {
        imageUrl = game.image;
    } else {
        imageUrl = `${CDN_BASE_URL}${game.image}`;
    }
    return imageUrl;
}

/**
 * Toggles the fullscreen mode for the game-frame-wrapper element.
 */
window.toggleFullscreen = function() {
    const wrapper = document.getElementById('game-frame-wrapper');
    if (!wrapper) return;

    if (!document.fullscreenElement) {
        // Enter fullscreen mode
        if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) { /* Safari */
            wrapper.webkitRequestFullscreen();
        } else if (wrapper.msRequestFullscreen) { /* IE11 */
            wrapper.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen mode
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msRequestFullscreen();
        }
    }
};

/**
 * Public function to close the embedded game and show the grid.
 */
window.closeGameEmbed = function() {
    const container = document.getElementById('game-embed-container');
    const gameFrameWrapper = document.getElementById('game-frame-wrapper');
    const gameGrid = document.getElementById('gameGrid');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput'); 
    const gameWindow = document.getElementById('game-window');

    if (container) {
        if (gameFrameWrapper) {
            gameFrameWrapper.innerHTML = ''; // Clear iframe or play now screen
        }
        container.style.display = 'none'; // Hide container
    }
    
    // Ensure the zoom-in effect class is removed upon closing
    if (gameWindow) {
        gameWindow.classList.remove('zoom-in-effect');
    }

    // Show the game list elements again
    if (gameGrid) {
        gameGrid.style.display = 'grid';
        window.scrollTo({ top: gameGrid.offsetTop, behavior: 'smooth' });
    }
    if (paginationContainer) {
        paginationContainer.style.display = 'flex';
    }
    if (searchInput) {
        searchInput.parentElement.style.display = 'block'; 
    }
};

// 💥 FUNCTION: Open the game in a separate about:blank window
window.openGameInNewWindow = function() {
    // Requires 'lastLaunchedGame' to be defined in the scope of your application.
    if (typeof lastLaunchedGame === 'undefined' || !lastLaunchedGame.link) {
        alert("Error: Game link is missing. Please close and relaunch the game.");
        return;
    }
    const gameLink = lastLaunchedGame.link;
    const gameName = lastLaunchedGame.name;

    window.closeGameEmbed();

    const windowTitle = `${gameName}`;

    fetch(gameLink)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch game content: HTTP status ${response.status}`);
            }
            return response.text();
        })
        .then(htmlContent => {
            const newWindow = window.open('about:blank', '_blank');

            if (newWindow) {
                // Force desktop viewport scaling in the new tab too
                const desktopContent = htmlContent.replace(
                    /<meta\s+name=["']viewport["']\s+content=["'][^"']*["']/i, 
                    '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes"'
                );
                
                // Aggressively inject CSS into the new window for scaling as well
                const aggressiveStyle = `
                    <style>
                        html, body {
                        overflow: auto !important; /* CHANGE TO AUTO OR SCROLL */
                        }
                    </style>
                `;
                let finalContent = desktopContent.replace(/<\/head>/i, `${aggressiveStyle}</head>`);
                
                newWindow.document.open();
                newWindow.document.write(finalContent);
                newWindow.document.close();
                newWindow.document.title = windowTitle;
            } else {
                console.error("Popup blocker prevented game launch. Opening direct link instead.");
                window.open(gameLink, '_blank'); 
            }
        })
        .catch(error => {
            console.error("Error loading game into new window:", error);
            alert("Error: Failed to load game content into new window.");
        });
}

// ------------------------------------------------------------------
// 💥 FUNCTION: Handles the smooth zoom-in transition and final embed
// ------------------------------------------------------------------
window.playGameTransition = function(gameLink, name, windowTitle) {
    const embedContainer = document.getElementById('game-embed-container');
    const gameFrameWrapper = document.getElementById('game-frame-wrapper');
    const gameWindow = document.getElementById('game-window'); // Target for zoom

    if (!embedContainer || !gameFrameWrapper || !gameWindow) {
        console.error("Critical Error: Required embed elements for transition not found.");
        return;
    }

    // --- Transition Logic ---
    
    // 1. Visually hide the Play Now screen and start zoom
    const playNowScreen = document.getElementById('play-now-screen');
    
    if (playNowScreen) {
        // Hide the play screen quickly
        playNowScreen.style.opacity = '0';
        playNowScreen.style.pointerEvents = 'none';
        // Set the wrapper background to match the game window for a clean transition
        gameFrameWrapper.style.backgroundColor = 'transparent'; 
    }

    // 2. Apply a temporary class to the game-window to trigger the smooth zoom effect
    gameWindow.classList.add('zoom-in-effect'); 
    
    // 3. Wait for the transition to visually complete (Tailwind default is 300ms)
    setTimeout(() => {
        
        // Remove the temporary class to reset the scale for normal use
        gameWindow.classList.remove('zoom-in-effect');
        
        // 4. Proceed with the original game embedding logic (iframe creation and content fetch)
        
        // Store the game link and name for the new window button
        if (typeof lastLaunchedGame !== 'undefined') {
            lastLaunchedGame.link = gameLink;
            lastLaunchedGame.name = name;
        }

        // Create the target iframe first
        const iframe = document.createElement('iframe');
        iframe.src = 'about:blank'; // Use about:blank as the source
        iframe.id = 'embedded-game-iframe';
        iframe.title = windowTitle;
        
        // Set permissions and styles
        iframe.allowFullscreen = true;      
        iframe.allow = 'accelerometer; gyroscope; fullscreen; camera; microphone; gamepads; autoplay; clipboard-read; clipboard-write';
        iframe.style.width = '100%';
        iframe.style.height = '100%';      
        iframe.style.border = 'none';

        gameFrameWrapper.innerHTML = ''; // Clear the Play Now screen (and the background image)
        gameFrameWrapper.appendChild(iframe);
        
        // Fetch the content and inject it into the iframe
        fetch(gameLink)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch game content: HTTP status ${response.status}`);
                }
                return response.text();
            })
            .then(htmlContent => {
                
                // 1. Force desktop viewport scaling      
                let finalContent = htmlContent.replace(
                    /<meta\s+name=["']viewport["']\s+content=["'][^"']*["']/i,
                    '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes"'
                );
                
                // 💥 CRUCIAL FIX: Aggressive CSS to force 100% height/width on the game's internal elements.
                const aggressiveStyle = `
                    <style>
                        html, body {
                        overflow: hidden !important;
                        }
                    </style>
                `;

                // 2. Insert the aggressive CSS right before the closing </head> tag
                finalContent = finalContent.replace(/<\/head>/i, `${aggressiveStyle}</head>`);
                
                const iframeDoc = iframe.contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(finalContent); // Use the modified content
                iframeDoc.close();
                iframeDoc.title = windowTitle;

                // Scroll to the game embed
                window.scrollTo({ top: embedContainer.offsetTop, behavior: 'smooth' });

            })
            .catch(error => {
                console.error("Error loading game content via injection:", error);
                alert("Error: Failed to load game content. This may be due to network issues or restrictive file hosting.");
                window.closeGameEmbed();
            });

    }, 400); // Wait 400ms for a visually smooth transition
}

// ------------------------------------------------------------------

/**
 * 💥 MODIFIED EMBED FUNCTION: Now shows a 'Play Now' button with game image background.
 * Also updates the "Play Fullscreen" button with the game image.
 * @param {string} path - The path to the game HTML file.
 * @param {string} name - The name of the game.
 */
window.openGame = function(path, name) {
    const gameLink = `${CDN_BASE_URL}${path}`;
    const windowTitle = `${name} | Delta V9 Game`;
    
    // 1. Find Game Image URL
    const gameInfo = MOCK_GAMES.find(g => g.name === name);
    let imageUrl = '';
    if (gameInfo && gameInfo.image) {
        if (gameInfo.image.startsWith('http')) {
            imageUrl = gameInfo.image;
        } else {
            imageUrl = `${CDN_BASE_URL}${gameInfo.image}`;
        }
    }
    // Use a standard placeholder image if not found
    const placeholderUrl = `https://placehold.co/1280x720/1e293b/06b6d4?text=GAME+LOADING...`;
    const finalImageUrl = imageUrl || placeholderUrl;
    
    const embedContainer = document.getElementById('game-embed-container');
    const gameFrameWrapper = document.getElementById('game-frame-wrapper');
    const gameGrid = document.getElementById('gameGrid');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');    
    const gameTitleDisplay = document.getElementById('game-title-display');
    const gameWindow = document.getElementById('game-window'); // Needed for CSS injection

    if (!embedContainer || !gameFrameWrapper || !gameWindow) {
        console.error("Critical Error: Required game embed elements not found. Check HTML structure.");
        alert("Error: Game embed container not found. Check HTML structure.");
        return;
    }

    // 2. Setup container and hide surrounding elements
    gameFrameWrapper.innerHTML = '';
    embedContainer.style.display = 'flex';

    if (gameGrid) gameGrid.style.display = 'none';
    if (paginationContainer) paginationContainer.style.display = 'none';
    if (searchInput) searchInput.parentElement.style.display = 'none';
    if (gameTitleDisplay) gameTitleDisplay.textContent = name;
    
    // Store the game link and name
    if (typeof lastLaunchedGame !== 'undefined') {
        lastLaunchedGame.link = gameLink;
        lastLaunchedGame.name = name;
    }

    // 💥 NEW: Update the 'Play Fullscreen' button with the game image (assumes HTML structure)
    const newWindowButtonImageContainer = document.getElementById('new-window-image');
    if (newWindowButtonImageContainer) {
        const gameName = name.replace(/'/g, "\\'");
        
        // Remove existing image first
        newWindowButtonImageContainer.innerHTML = ''; 

        if (finalImageUrl) {
            newWindowButtonImageContainer.innerHTML = `
                <img src="${finalImageUrl}" 
                     alt="${gameName} Thumbnail" 
                     class="game-embed-button-image"
                     onerror="this.onerror=null; this.src='https://placehold.co/100x40/1e293b/06b6d4?text=${gameName.replace(/\s/g, '+')}';">
            `;
        }
    }
    
    // 3. Create the Play Now screen and button
    const safeLink = gameLink.replace(/'/g, "\\'");
    const safeName = name.replace(/'/g, "\\'");
    const safeTitle = windowTitle.replace(/'/g, "\\'");

    // 💥 MODIFIED HTML STRUCTURE FOR IMAGE IN BUTTON
    const playNowHtml = `
        <div id="play-now-screen" class="absolute inset-0 flex flex-col items-center justify-center 
            transition-opacity duration-300"
            style="opacity: 1; z-index: 10;"> 
            
            <img id="game-transition-image" src="${finalImageUrl}" 
                 alt="${name} Background" 
                 class="absolute inset-0 w-full h-full object-cover 
                        filter blur-lg brightness-[.4] 
                        transition-transform duration-500 ease-out"
                 style="transform: scale(1.05);"/> 
            
            <div class="flex flex-col items-center justify-center relative w-full h-full" style="z-index: 30;">
                
                <button onclick="playGameTransition('${safeLink}', '${safeName}', '${safeTitle}')"
                    class="flex flex-col items-center justify-center space-y-3 p-6 rounded-3xl text-white 
                    glass-button shadow-2xl neon-glow-button hover:scale-105 transition duration-200"
                    style="min-width: 200px;">
                    
                    <div class="w-24 h-24 rounded-lg overflow-hidden border-2 border-white/50 shadow-xl">
                        <img src="${finalImageUrl}" 
                             onerror="this.onerror=null; this.src='https://placehold.co/96x96/0f172a/94a3b8?text=NO+IMG';"
                             alt="${name} Thumbnail"
                             class="w-full h-full object-cover">
                    </div>
                    
                    <span class="text-3xl font-extrabold tracking-wide">Play Now</span>
                </button>
            </div>
        </div>
        <style>
            /* Injecting custom CSS for Glassmorphism effect */
            .glass-button {
                /* Very light translucent white */
                background-color: rgba(255, 255, 255, 0.1); 
                /* Stronger blur for "liquid" look (requires modern browsers/Tailwind config) */
                backdrop-filter: blur(15px); 
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .neon-glow-button {
                box-shadow: 0 0 15px rgba(46, 220, 255, 0.7);
            }
            /* If Tailwind's 'blur-lg' is not defined, this fallback CSS would be needed: */
            #game-transition-image {
                 filter: blur(8px) brightness(0.4); 
            }
        </style>
    `;

    // Clear and insert the Play Now screen
    gameFrameWrapper.innerHTML = playNowHtml;
    
    // 4. Scroll to the game embed
    window.scrollTo({ top: embedContainer.offsetTop, behavior: 'smooth' });
};


// ------------------------------------------------------------------
// ⚡️ EXTREME AND FAST 3D TILT EFFECT FUNCTION (MODIFIED)
// ------------------------------------------------------------------
/**
 * Applies 3D tilt and neon effects dynamically to the game card.
 * @param {HTMLElement} card - The game card element (the outer container).
 */
function addTiltEffect(card) {
    const maxTilt = 12; // Adjusted for a slightly smoother effect
    const neonGlow = '0 0 40px 15px rgba(46, 220, 255, 0.7), 0 0 80px 10px rgba(46, 220, 255, 0.2)'; // More layered and intense glow
    const scaleFactor = 1.05; // Slightly less extreme scale for better fit on grid
    
    // FASTER: Decreased transition duration for quicker response
    card.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out';
    card.style.willChange = 'transform, box-shadow';
    card.style.transformOrigin = 'center';

    card.addEventListener('mousemove', (e) => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;

        const xPos = (e.clientX - centerX) / (cardRect.width / 2);
        const yPos = (e.clientY - centerY) / (cardRect.height / 2);

        // Calculate rotation (Invert Y for natural tilt effect)
        const rotY = xPos * maxTilt;
        const rotX = yPos * maxTilt * -1; 
        
        // Apply transform: scale, 3D tilt, and subtle lift (translateZ)
        // Note: Using translateZ(30px) for a deeper 3D pop.
        card.style.transform = `scale(${scaleFactor}) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(30px)`; 
        
        // Apply a dark, solid background to the card image wrapper on hover to enhance the neon border pop
        const imgWrapper = card.querySelector('.game-card-image-wrapper');
        if (imgWrapper) {
            imgWrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Dark overlay for image
        }

        card.style.boxShadow = neonGlow;
        card.style.borderColor = 'rgb(46 220 255)'; // Bright cyan border
    });

    card.addEventListener('mouseleave', () => {
        // Reset the card to its default state 
        card.style.transform = `scale(1) rotateX(0deg) rotateY(0deg) translateZ(0)`;
        
        // Use a more distinct default shadow for better initial looks
        card.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5), 0 0 3px rgba(46, 220, 255, 0.1)'; 
        card.style.borderColor = 'rgb(71 85 105)'; // slate-700
        
        // Reset the image wrapper background
        const imgWrapper = card.querySelector('.game-card-image-wrapper');
        if (imgWrapper) {
            imgWrapper.style.backgroundColor = 'transparent'; 
        }
    });

    // Initial setup: Apply a subtle static style (default shadow and 3D context)
    card.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5), 0 0 3px rgba(46, 220, 255, 0.1)';
    card.style.transform = 'translateZ(0)'; // Establish 3D context
}
// ------------------------------------------------------------------

/**
 * Renders the pagination buttons based on the filtered game list.
 * NOTE: This is an internal helper function.
 */
function renderPagination(games) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(games.length / GAMES_PER_PAGE);

    if (totalPages <= 1) return;

    let pagesHtml = '';

    // Previous Page Button
    pagesHtml += `<button onclick="changePage(${currentPage - 1})"
        ${currentPage === 1 ? 'disabled' : ''}
        class="px-4 py-2 rounded-lg text-slate-400 bg-slate-800 border border-slate-700
        ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-700 hover:text-white transition duration-150'}">
        &laquo; Previous
    </button>`;

    // Page number buttons (Simplified to show current, next, and last page)
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        pagesHtml += `<button onclick="changePage(${i})"
            class="px-4 py-2 rounded-lg font-bold
            ${isActive ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-cyan-400 border border-slate-700 hover:bg-cyan-700 hover:text-white transition duration-150'}">
            ${i}
        </button>`;
    }

    // Next Page Button
    pagesHtml += `<button onclick="changePage(${currentPage + 1})"
        ${currentPage === totalPages ? 'disabled' : ''}
        class="px-4 py-2 rounded-lg text-slate-400 bg-slate-800 border border-slate-700
        ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-700 hover:text-white transition duration-150'}">
        Next &raquo;
    </button>`;

    paginationContainer.innerHTML = pagesHtml;
}

// ------------------------------------------------------------------

/**
 * Renders the game cards onto the grid based on the current page number. (MODIFIED)
 * NOTE: This is an internal helper function.
 */
function renderGames() {
    const gameGrid = document.getElementById('gameGrid');
    if (!gameGrid) {
        console.error("Critical Error: 'gameGrid' element not found. Check your HTML ID.");
        return;
    }

    // Ensure gameGrid is visible before rendering cards (in case it was hidden by openGame)
    const embedContainer = document.getElementById('game-embed-container');
    if (embedContainer && embedContainer.style.display !== 'none') {
        // If game is currently embedded, don't re-render the grid
        return;      
    }
    
    gameGrid.innerHTML = ''; // Clear existing cards

    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    const endIndex = startIndex + GAMES_PER_PAGE;

    // Slice the current filtered list for the current page
    const gamesToRender = currentFilteredGames.slice(startIndex, endIndex);

    if (gamesToRender.length === 0 && currentFilteredGames.length > 0) {
        // If we landed on an empty page, reset to page 1
        currentPage = 1;
        renderGames();
        return;
    } else if (currentFilteredGames.length === 0) {
          gameGrid.innerHTML = '<p class="col-span-full text-center text-xl text-slate-500 p-8">No games matched your search query.</p>';
          renderPagination([]); // Clear pagination
          return;
    }


    const html = gamesToRender.map((game, index) => { // Added index for unique ID
        if (!game || !game.name || !game.path || !game.image) return '';

        const baseImageUrl = game.image;
        let imageUrl;

        if (baseImageUrl.startsWith('http')) {
            imageUrl = baseImageUrl;
        } else {
            // Correctly forms the CDN URL using the root path
            imageUrl = `${CDN_BASE_URL}${baseImageUrl}`;
        }

        const placeholderUrl = `https://placehold.co/400x160/1e293b/06b6d4?text=${game.name.replace(/\s/g, '+')}`;

        const safePath = game.path.replace(/'/g, "\\'");
        const safeName = game.name.replace(/'/g, "\\'");

        const cardId = `game-card-${index}`;

        // 💥 MODIFIED: Removed 'bg-slate-900' and added 'game-card-animated' and 'animation-delay' for staggered load.
        return `
            <div class="game-card-perspective-container relative">
                <div id="${cardId}" onclick="openGame('${safePath}', '${safeName}')"
                    class="game-card block rounded-xl shadow-lg overflow-hidden border-2 border-slate-700 cursor-pointer transition-all duration-300 transform-gpu relative z-10 hover:z-20 game-card-animated"
                    style="animation-delay: ${index * 0.05}s;">
                    <div class="game-card-image-wrapper h-32 sm:h-40 overflow-hidden transition-colors duration-300">
                        <img src="${imageUrl}"
                            onerror="this.onerror=null; this.src='${placeholderUrl}';"
                            alt="${game.name} Thumbnail"
                            class="w-full h-full object-cover">
                    </div>
                    <div class="p-4 text-center">
                        <h3 class="text-white font-mono font-bold text-lg sm:text-xl truncate">${game.name}</h3>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    gameGrid.innerHTML = html;

    // 💥 Apply the tilt effect and clean up animation class
    document.querySelectorAll('.game-card').forEach(card => {
        addTiltEffect(card);
        
        // CRITICAL FIX for tilt: Remove the animation class once the animation is done 
        // to prevent CSS from overriding the JS 'transform' property used for tilting.
        card.addEventListener('animationend', () => {
            card.classList.remove('game-card-animated');
        }, { once: true }); // Automatically remove listener after first run
    });

    // Always render pagination after rendering the games
    renderPagination(currentFilteredGames);
}

// ------------------------------------------------------------------

/**
 * Public function to switch pages. Called by pagination buttons.
 * @param {number} pageNumber - The page to switch to.
 */
window.changePage = function(pageNumber) {
    const totalPages = Math.ceil(currentFilteredGames.length / GAMES_PER_PAGE);

    // Prevent going out of bounds
    if (pageNumber < 1 || pageNumber > totalPages) {
        return;
    }

    currentPage = pageNumber;
    renderGames();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back to the top of the grid
}

// ------------------------------------------------------------------

/**
 * Filters the games based on the search query. Called by the search input's oninput.
 */
window.filterGames = function(query) {
    const lowerCaseQuery = query.toLowerCase();

    // 1. Filter the entire MOCK_GAMES list
    currentFilteredGames = MOCK_GAMES.filter(game => {
        if (!game || !game.name) return false;

        return game.name.toLowerCase().includes(lowerCaseQuery) ||
               (game.type && game.type.toLowerCase().includes(lowerCaseQuery));
    });

    // 2. Reset the page number and render the first page of results
    currentPage = 1;
    renderGames();
}


// ------------------------------------------------------------------
// 💥 NEW MOUSE HIGHLIGHT LOGIC FOR GAME CARDS 💥
// ------------------------------------------------------------------

/**
 * 1. Inject the necessary highlight element into the page.
 */
function injectGameHighlightElement() {
    const highlightHtml = `
        <div id="game-highlight-follower" class="absolute w-40 h-40 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" 
             style="opacity: 0; transition: opacity 0.3s ease-out; z-index: 10;"></div>
    `;
    // Inject into the body once
    document.body.insertAdjacentHTML('afterbegin', highlightHtml);
}

/**
 * 2. Handle the mouse tracking logic using event delegation on the grid.
 */
function setupGameCardHighlight() {
    const gameGrid = document.getElementById('gameGrid');
    const follower = document.getElementById('game-highlight-follower');

    if (!gameGrid || !follower) return;

    // We track the mouse relative to the ENTIRE WINDOW (document) 
    // to keep the light centered correctly, regardless of scroll position.
    
    // We'll use the bounding box of the currently hovered card to constrain the light.
    let currentCard = null;

    // This listener shows/hides the light and sets the card context
    gameGrid.addEventListener('mouseover', (e) => {
        // Find the closest game card (or the card itself)
        const card = e.target.closest('.game-card');
        
        if (card) {
            currentCard = card;
            follower.style.opacity = '1';
        } else {
            currentCard = null;
            follower.style.opacity = '0';
        }
    });

    gameGrid.addEventListener('mousemove', (e) => {
        if (!currentCard) return;

        // Calculate position relative to the viewport (clientX/Y)
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Get the coordinates of the card
        const cardRect = currentCard.getBoundingClientRect();

        // ABSOLUTE CENTERING: Moves element to mouse coordinates and offsets it by 50% of its size.
        // We use absolute viewport coordinates here.
        follower.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    gameGrid.addEventListener('mouseleave', () => {
        currentCard = null;
        follower.style.opacity = '0';
    });
}

// ------------------------------------------------------------------


/**
 * 💥 NEW FUNCTION: Injects reusable CSS classes and keyframes into the document head.
 * FIX: Added Play Fullscreen button styling (new-window-button) and card animation.
 */
function injectGlobalStyles() {
    if (document.getElementById('global-game-styles')) return;

    const style = document.createElement('style');
    style.id = 'global-game-styles';
    style.innerHTML = `
        /* Game Card Load Animation Keyframes */
        @keyframes slideIn {
            0% {
                opacity: 0;
                transform: translateY(30px) scale(0.95) translateZ(0); 
            }
            100% {
                opacity: 1;
                /* FIX: Reset transform to ONLY translateZ(0) so JS can fully control rotate/scale for tilt */
                transform: translateZ(0);
            }
        }
        
        /* Base Animation Class for Game Cards */
        .game-card-animated {
            animation: slideIn 0.4s ease-out forwards; /* 400ms duration, keep visible after finish */
            opacity: 0; /* Ensures it starts invisible */
        }

        /* 💥 CRITICAL FIX FOR TILTING: Establish 3D context on the card container */
        .game-card-perspective-container {
            perspective: 1000px; 
        }

        /* Ensure the card itself rotates correctly in 3D space */
        .game-card {
            transform-style: preserve-3d;
            background-color: transparent !important; /* 💥 USER REQUEST: Force Transparency */
        }


        /* 💥 START: EMBEDDED PLAY FULLSCREEN BUTTON STYLING (IMAGE ON TOP) */
        #new-window-button {
            display: flex;
            flex-direction: column; /* Stack image and text vertically (Image on Top) */
            align-items: center;
            justify-content: flex-start; 
            background-color: #06b6d4; /* Cyan background */
            color: white;
            border: none;
            border-radius: 0.5rem; 
            padding: 0;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            position: relative; 
            overflow: hidden;
            width: 100%;
            height: 100%;
            min-width: 150px;
        }
        
        #new-window-button:hover {
            background-color: #0891b2; /* Darker cyan on hover */
            transform: scale(1.02);
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
        }

        #new-window-image {
            width: 100%;
            height: 75%; /* Image takes up most of the button's height */
            background-color: #1e293b; /* slate-800 placeholder color */
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            border-bottom: 2px solid #0891b2;
            position: relative;
            z-index: 2; 
        }

        .game-embed-button-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .new-window-button-label {
            padding: 0.5rem;
            font-weight: bold;
            font-size: 1rem;
            width: 100%;
            text-align: center;
            background-color: inherit;
            position: relative;
            z-index: 3; /* Ensure text is visible */
        }
        /* 💥 END: EMBEDDED PLAY FULLSCREEN BUTTON STYLING */
    `;
    document.head.appendChild(style);
}

// ------------------------------------------------------------------


/**
 * 💥 STARTUP: This function is called by the main SPA router every time the /games page is loaded.
 */
window.initGameGrid = function() {
    // 0. Inject reusable global styles (NEW)
    injectGlobalStyles();
    
    // 1. Ensure the highlight element exists when the page is loaded (only runs once)
    if (!document.getElementById('game-highlight-follower')) {
        injectGameHighlightElement();
        setupGameCardHighlight();
    }
    
    // This logic ensures the CDN path is being used before trying to load games
    if (CDN_BASE_URL.includes("ethanlb34/Delta-Games@main/")) {
        // Load all games initially into the filtered list
        currentFilteredGames = MOCK_GAMES;
        currentPage = 1; // Reset to page 1 on load
        
        // Ensure the grid/pagination are visible on page load (in case user navigated back)
        const gameGrid = document.getElementById('gameGrid');
        const embedContainer = document.getElementById('game-embed-container');
        const pagination = document.getElementById('pagination');
        const searchInput = document.getElementById('searchInput');

        if (gameGrid) gameGrid.style.display = 'grid';
        if (embedContainer) embedContainer.style.display = 'none';
        if (pagination) pagination.style.display = 'flex';
        if (searchInput) searchInput.parentElement.style.display = 'block';

        renderGames();
    } else {
        const gameGrid = document.getElementById('gameGrid');
        if (gameGrid) {
             gameGrid.innerHTML = '<p class="col-span-full text-center text-2xl text-red-400 p-8 border-2 border-red-500 rounded-lg bg-red-900/50">ERROR: Please update the CDN_BASE_URL variable in the script with your actual game host URL to make the links work.</p>';
        }
    }
};