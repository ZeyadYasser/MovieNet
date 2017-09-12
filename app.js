
var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onload = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
        }
}
var get_movie_data = function(id){
    var request = new XMLHttpRequest();

    var url = "https://api.themoviedb.org/3/movie/" + id.toString() + "?api_key=b0db8d75082ed396f71e0a1e80d7a01e";
    request.open('GET', url, false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
      return JSON.parse(request.responseText);
    }
}

function hide(id){
    document.getElementById(id).style.visibility = "hidden";
}
function show(id){
    document.getElementById(id).style.visibility = "visible";
}



var offset = 0;
var items = [];
function get_recommendations(){
    var imdbID = document.getElementById("imdbID").value;
    var client = new HttpClient();
    var url = "https://zeyadyasser.pythonanywhere.com/get_recommendations?user_imdb_id=" + imdbID;
    hide("homepage");
    show("loader");
    client.get(url, function(response) {
        hide("loader");
        show("movie-wrapper");
        items = JSON.parse(response)
        next();
    });
}

function previous(){
    if (offset != 1){
        offset-=2;
        next();
    }
}

last_cached = 0;
movies_data = [];
function cache(n){
    ImageSmallBaseURL = "http://image.tmdb.org/t/p/w500";
    ImageLargeBaseURL = "http://image.tmdb.org/t/p/w1000";
    for(i=0; i<n; i++){
        movie_data = get_movie_data(items[last_cached + i]);
        if (movie_data==null) continue;
        //cache image
        movie_data["cache"] = [];
        if (movie_data["poster_path"]){
            var posterCache = new Image();
            posterCache.src = ImageSmallBaseURL + movie_data["poster_path"];
            movie_data["cache"].push(posterCache);
        }
        else{
            console.log("couldn't load poster image");
        }
        if(movie_data["backdrop_path"]){
            var backgroundCache = new Image();
            backgroundCache.src = ImageLargeBaseURL + movie_data["backdrop_path"];
            movie_data["cache"].push(backgroundCache);
        }
        else{
            console.log("couldn't load background image");
        }
        movies_data.push(movie_data);
    }
    last_cached+=n;
}

function next(){
    if (last_cached == 0) cache(5);
    else if (last_cached <= offset+2){
            cache(1);
        }
    rank = (offset + 1).toString() + ". ";
    movie_data = movies_data[offset];
    document.getElementById("movie-poster").src = "http://image.tmdb.org/t/p/w500" + movie_data["poster_path"];
    document.getElementById("movie-title").innerHTML = rank + movie_data["original_title"];
    document.getElementById("movie-date").innerHTML = movie_data["release_date"];
    document.getElementById("movie-runtime").innerHTML = movie_data["runtime"] + " min";
    document.getElementById("movie-genre").innerHTML = movie_data["genres"][0]["name"];
    document.getElementById("movie-overview").innerHTML = movie_data["overview"].substring(0,280) + "...";
    document.getElementById("movie-readmore").href = "http://www.imdb.com/title/" + movie_data["imdb_id"] + "/plotsummary?ref_=tt_stry_pl" ;
    movie_background_url ="http://image.tmdb.org/t/p/w1000" +  movie_data["backdrop_path"]; 
    document.getElementById("movie-background").style.background="url(" + movie_background_url + "),rgba(100,0,100,1)";
    offset+=1;
}

// click button if enter key is pressed
function EnterKeyPressed(event){
    if (event.keyCode == 13){
        get_recommendations();
    }
}

function reset(){
    hide("movie-wrapper");
    show("homepage");
    offset = 0;
    items = [];
}

document.onkeydown = function (e) {
    e = e || window.event;
    if (items.length != 0){
        if (e.keyCode == 39) next();
        if (e.keyCode == 37) previous();
    }
};
