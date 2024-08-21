let currentSong = new Audio(); // global because I want to play one music at a time
let currentFolder;
let songs; // to get songs from song array
console.log("JavaScript is running");

// Function to format time from seconds to minute:second format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

// Function to get songs from a folder
async function getSongs(folder) {
  currentFolder = folder;
  let myobject = await fetch(`http://192.168.1.7:3000/${folder}/`); // fetch
  let response = await myobject.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  console.log(div)
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  console.log(songs)
  
  // Populate the playlist
  let playlist = document.querySelector(".songlist ul");
  playlist.innerHTML = "";
  for (const element of songs) {
    console.log(element)
    playlist.innerHTML += `<li>
            <img class="invert" src="music.svg" alt="listen-music">
            <div class="songInfo">
                <div>${element.replaceAll("%20"," ")}</div>
            </div>
            <div class="play-now">
                <span>Play Now</span>
                <img class="invert" src="cur_play.svg" alt="play-now">
            </div>
        </li>`
  }

  // Add click event listeners to the songs in the playlist
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".songInfo").firstElementChild.innerHTML); // song name must match with song in songs folder
      playMusic(e.querySelector(".songInfo").firstElementChild.innerHTML); // play music function call one to all song name accordingly
    });
  });

  return songs;// if not then album switching won't work
}

// Function to initialize the volume slider
const volumeSlider = document.querySelector(".volume-slider");
function initializeVolumeSlider() {
  volumeSlider.value = currentSong.volume * 100; // Convert volume to percentage
}

// Function to play music
const playMusic = (music, pause = false) => {
  currentSong.src = `/${currentFolder}/` + music; // match your song name with songs available in songs folder
  if (!pause) {
    currentSong.play();
    cur.src = "pause.svg";
  }
  // Initialize volume slider
  initializeVolumeSlider();
  // Update song details
  document.querySelector(".song-details").innerHTML = decodeURI(music);
  document.querySelector(".song-timing").innerHTML = "00:00/00.00";

  // Handle metadata loading
  currentSong.onloadedmetadata = () => {
    document.querySelector(".song-timing").innerHTML = `00:00/${formatTime(currentSong.duration)}`;
  };
};
// function to make dynamic albun
async function getAlbum() {
  let cardContainer=document.querySelector(".cardContainer")
  let myobject = await fetch(`http://192.168.1.7:3000/songs/`); // fetch
  let response = await myobject.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors=div.getElementsByTagName("a")
  let array=Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
      const e= array[index];

    if(e.href.includes("/song")){
      let space=e.href.split("/").slice("-2")[0]
      let folder=decodeURI(space)
      //meta data of the folder
      let myobject = await fetch(`http://192.168.1.7:3000/songs/${folder}/info.json`)
      let response = await myobject.json();
      cardContainer.innerHTML= cardContainer.innerHTML+` <div data-folder="${folder}"class="card album-one">
                        <img id="play_butt" src="play.svg" alt="play">
                        <img src="./songs/${folder}/cover.jpeg" alt="${folder}">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
    }
  }
   // Load the playlist
   Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      if (songs.length > 0) {
        playMusic(songs[0]); // Play the first song by default
      }
    })
  })
}
// Main function
async function main() {
  await getSongs("songs/Today'sTopHits");
  playMusic(songs[0], true); // Play the first song by default
  //get album
   await getAlbum()
  // Play and pause functionality
  cur.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      cur.src = "pause.svg";
    } else {
      currentSong.pause();
      cur.src = "cur_play.svg";
    }
  })

  // Time update event listener
  currentSong.addEventListener("timeupdate", () => {
    if (!isNaN(currentSong.duration)) {
      document.querySelector(".song-timing").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
      const seekbar = document.querySelector(".seekbar-input");
      seekbar.value = (currentSong.currentTime / currentSong.duration) * 100;
    }
  });

  // Seekbar input event listener
  document.querySelector(".seekbar-input").addEventListener("input", (event) => {
    const seekTo = currentSong.duration * (event.target.value / 100);
    currentSong.currentTime = seekTo;
  });

  // Hamburger icon event listener
  document.querySelector(".display").addEventListener("click", () => {
    document.querySelector(".display").style.display = "none";
    document.querySelector(".left").style.transform = "translateX(0)";
    document.querySelector(".right").style.transition = "all 0.5s ease";
  });

  // Close button event listener
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".display").style.display = "inline-block";
    document.querySelector(".left").style.transform = "translateX(-360px)";
    document.querySelector(".right").style.transition = "all 0.5s ease";
  });

  // Previous button event listener
  document.getElementById("prev").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split(`/${currentFolder}/`)[1]);
    if (index > 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[songs.length - 1]);
    }
  });

  // Next button event listener
  document.getElementById("next").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split(`/${currentFolder}/`)[1]);
    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  // Volume mute/unmute event listener
  document.getElementById("volume").addEventListener("click", () => {
    currentSong.muted = !currentSong.muted;
    volume.src = currentSong.muted ? "mute.svg" : "volume.svg";
  });

  // Volume slider input event listener
  volumeSlider.addEventListener("input", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });


}

main();
