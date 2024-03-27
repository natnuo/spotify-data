"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_handlebars_1 = require("express-handlebars");
const spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.engine("hbs", (0, express_handlebars_1.engine)({ extname: "hbs", defaultLayout: "main", layoutsDir: __dirname + "/views/layouts/" }));
app.set("views", __dirname + "/views");
app.set("view engine", "hbs");
app.use(express_1.default.static(__dirname + "/public"));
const HOSTNAME = "https://natnuo-spotify-data-bcf8ecc1a8d6.herokuapp.com";
const spotifyApi = new spotify_web_api_node_1.default({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: `${HOSTNAME}/currently-playing`,
});
const generateRandomString = (length = 6) => Math.random().toString(20).substring(2, 2 + length);
const scopes = ["user-read-private", "user-read-email", "user-top-read", "user-read-currently-playing"];
const DISPLAY_WIDTH = 420;
const DISPLAY_HEIGHT = 88;
const CURRENTLY_PLAYING_REDIRECT_URI = `${HOSTNAME}/currently-playing`;
const TOP_SONGS_REDIRECT_URI = `${HOSTNAME}/top-songs/`;
const redirectToAuth = (redirectUri, res) => {
    spotifyApi.setRedirectURI(redirectUri);
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, generateRandomString(16));
    res.redirect(authorizeURL);
};
const CURRENTLY_PLAYING_DEFAULT_SONG_TITLE = "Not currently playing...";
const TOP_SONGS_DEFAULT_SONG_TITLE = "Server error...";
const DEFAULT_SONG_ARTIST = "";
const DEFAULT_ALBUM_COVER_URL = HOSTNAME + "/default_cover.png";
const CURRENTLY_PLAYING_EXTRA_SCRIPT = "setTimeout(location.reload(), 1000);";
const TOP_SONGS_EXTRA_SCRIPT = "";
app.get("/callback", (req, res) => {
    console.log(req.query);
    res.send("");
});
app.get("/currently-playing", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.query.code) {
        spotifyApi.setRedirectURI(CURRENTLY_PLAYING_REDIRECT_URI);
        spotifyApi.authorizationCodeGrant(req.query.code).then((data) => {
            console.log(data.body);
            spotifyApi.setAccessToken(data.body.access_token);
            spotifyApi.setRefreshToken(data.body.refresh_token);
            spotifyApi.getMyCurrentPlayingTrack().then((data) => {
                const item = data.body.item;
                console.log(data);
                res.render("song.hbs", {
                    width: DISPLAY_WIDTH,
                    height: DISPLAY_HEIGHT,
                    albumCoverURL: item ? item.album.images[0].url : DEFAULT_ALBUM_COVER_URL,
                    songTitle: item ? item.name : CURRENTLY_PLAYING_DEFAULT_SONG_TITLE,
                    songArtist: item ? item.artists.map((artist) => { return artist.name; }).join(", ") : DEFAULT_SONG_ARTIST,
                    extraScript: CURRENTLY_PLAYING_EXTRA_SCRIPT,
                });
            }, (err) => {
                console.log("Error when retrieving current track", err);
                res.render("song.hbs", {
                    width: DISPLAY_WIDTH,
                    height: DISPLAY_HEIGHT,
                    albumCoverURL: DEFAULT_ALBUM_COVER_URL,
                    songTitle: CURRENTLY_PLAYING_DEFAULT_SONG_TITLE,
                    songArtist: DEFAULT_SONG_ARTIST,
                    extraScript: CURRENTLY_PLAYING_EXTRA_SCRIPT,
                });
            });
        }, (err) => {
            redirectToAuth(CURRENTLY_PLAYING_REDIRECT_URI, res);
        });
    }
    else {
        redirectToAuth(CURRENTLY_PLAYING_REDIRECT_URI, res);
    }
}));
// ix is not zero-indexed; the lowest valid ix is 1
app.get("/top-songs/:ix", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.query.code) {
        spotifyApi.setRedirectURI(TOP_SONGS_REDIRECT_URI + req.params.ix);
        spotifyApi.authorizationCodeGrant(req.query.code).then((data) => {
            console.log(data.body);
            spotifyApi.setAccessToken(data.body.access_token);
            spotifyApi.setRefreshToken(data.body.refresh_token);
            const zeroIndexedIx = parseInt(req.params.ix) - 1;
            spotifyApi.getMyTopTracks().then((data) => {
                const item = data.body.items[zeroIndexedIx];
                console.log(data);
                res.render("song.hbs", {
                    width: DISPLAY_WIDTH,
                    height: DISPLAY_HEIGHT,
                    albumCoverURL: item ? item.album.images[0].url : DEFAULT_ALBUM_COVER_URL,
                    songTitle: item ? item.name : TOP_SONGS_DEFAULT_SONG_TITLE,
                    songArtist: item ? item.artists.map((artist) => { return artist.name; }).join(", ") : DEFAULT_SONG_ARTIST,
                    extraScript: TOP_SONGS_EXTRA_SCRIPT,
                });
            }, (err) => {
                console.log("Error when retrieving current track", err);
                res.render("song.hbs", {
                    width: DISPLAY_WIDTH,
                    height: DISPLAY_HEIGHT,
                    albumCoverURL: DEFAULT_ALBUM_COVER_URL,
                    songTitle: TOP_SONGS_DEFAULT_SONG_TITLE,
                    songArtist: DEFAULT_SONG_ARTIST,
                    extraScript: TOP_SONGS_EXTRA_SCRIPT,
                });
            });
        }, (err) => {
            redirectToAuth(TOP_SONGS_REDIRECT_URI + req.params.ix, res);
        });
    }
    else {
        redirectToAuth(TOP_SONGS_REDIRECT_URI + req.params.ix, res);
    }
}));
app.listen(port, () => {
    return console.log(`Listening at ${HOSTNAME}:${port}`);
});
