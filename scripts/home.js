function printNoMoreContent() {
    // Aggiunge un elemento che determina la fine dei contenuti mostrati
    // nel modo classico che conosciamo
    const feed = document.getElementById('feed');
    const div = document.createElement('div');
    div.classList.add('the_end');
    const divd = document.createElement('div');
    divd.textContent = "Nessun post da visualizzare";
    div.appendChild(divd);
    feed.appendChild(div);
}

function fetchPosts() {
    // Se nessun post è presente, ritorna null
    if (lastFetchedPostId === 0) return null;
    // Altrimenti, imposta l'utente se è settato
    const profile = document.body.dataset.user ? "?user="+document.body.dataset.user : "";

    // Nessun post è ancora stato pubblicato
    if (lastFetchedPostId === null) 
        fetch("fetch_post.php"+profile).then(fetchResponse).then(fetchPostsJson);
    else 
        // Prende i post pubblicati dopo l'ultimo visualizzato
        fetch("fetch_post.php?from="+lastFetchedPostId+profile).then(fetchResponse).then(fetchPostsJson);
}

function fetchResponse(response) {
    if (!response.ok) {return null};
    return response.json();
}

function fetchPostsJson(json) {
    console.log("Fetching...");
    console.log(json);
    const feed = document.getElementById('feed');
    
    for (let i in json) {
        const post = document.getElementById('post_template').content.cloneNode(true).querySelector(".post");
        // Memorizzo l'id del post
        post.dataset.id = post.querySelector("input[type=hidden]").value = json[i].postid;
        // Imposto il nome dell'autore
        const name = post.querySelector(".name");
        name.textContent = json[i].name + " " + json[i].surname;
        // Controllo se l'utente è verificato
        if (json[i].verified === '1') {
            const verified = document.createElement('span');
            verified.classList.add('verified');
            name.appendChild(verified);
        }
        // Imposto altre informazioni
        post.querySelector(".username").textContent = "@" + json[i].username;
        post.querySelector(".time").textContent = json[i].time;
        post.querySelector(".avatar img").src = json[i].propic;
        post.querySelector(".names > a").href = json[i].username;
        let content;
        // A seconda del tipo di contenuto, imposto il tipo di visualizzazione
        if (json[i].content.type != 'text') {
            switch (json[i].content.type) {
                case "spotify":
                    content = document.createElement('iframe');
                    content.src = "https://open.spotify.com/embed/track/"+json[i].content.id;
                    content.frameBorder = 0;
                    content.setAttribute('allowtransparency', 'true');
                    content.allow = "encrypted-media";
                    content.classList = "track_iframe";
                    break;
                default: break;
            }
            post.querySelector(".content").appendChild(content);
        }
        // Aggiungo la classe
        post.classList.add(json[i].content.type);
        // Imposto il testo
        post.querySelector(".text").textContent = json[i].content.text;
        // Controllo se l'utente ha messo like al post corrente
        const like = post.querySelector(".like");
        if (json[i].liked == 0) {
            // Aggiungo l'event listener per mettere like
            like.addEventListener('click', likePost);
        } else {
            // Aggiungo la classe liked e l'event listener per togliere il like
            like.classList.remove('like');
            like.classList.add('liked');
            like.addEventListener('click', unlikePost);
        }
        const nlike = like.querySelector("span");
        nlike.textContent = json[i].nlikes;
        // Aggiungo altri listener per altre funzionalità
        if (json[i].nlikes) nlike.addEventListener('click', likeView);
        post.querySelector(".comment").textContent = json[i].ncomments;
        post.querySelector(".comment").addEventListener('click', commentPost);
        post.querySelector("form").addEventListener('submit', sendNewComment);
        post.querySelector(".emotes").addEventListener('click', chooseEmote);

        feed.appendChild(post);
    }
    
    if (json.length < 20) {
        lastFetchedPostId =  0;
        printNoMoreContent();
    } else {
        // Prendo l'ultimo elemento del JSON
        lastFetchedPostId = json.pop().postid;
    }
    console.log("lastfetch"+lastFetchedPostId);
    onScrollCanLoad = true;
}

function likePost(event) {
    button = event.currentTarget;

    const formData = new FormData();
    // Prendo l'ID del post
    formData.append('postid', button.parentNode.parentNode.dataset.id);
    // Mando l'ID alla pagina PHP tramite fetch
    fetch("like_post.php", {method: 'post', body: formData}).then(fetchResponse)
    .then(function (json){ return updateLikes(json, button); });

    // Cambio la classe del bottone
    button.classList.remove('like');
    button.classList.add('liked');

    // Aggiorno i listener
    button.removeEventListener('click', likePost);
    button.addEventListener('click', unlikePost);
}

function updateLikes(json, button) {
    console.log(json.ok);
    if (!json.ok) return null;
    button.querySelector('span').textContent = json.nlikes;
    console.log("UPDAte" + json.nlikes);
    // Mostra le persone che hanno messo like solo se qualcuno lo ha fatto
    if (json.nlikes) 
        button.querySelector('span').addEventListener('click', likeView);
    else 
        button.querySelector('span').removeEventListener('click', likeView);
}

function likeView(event) {
    const button = event.currentTarget;
    const formData = new FormData();
    formData.append('postid', button.parentNode.parentNode.parentNode.dataset.id);
    fetch("fetch_likes.php", {method: 'post', body: formData}).then(fetchResponse).then(displayModalUsers);
    document.querySelector('#modal .modal_desc').textContent = "Persone a cui piace";

    console.log('Vedi Likes');
    event.stopPropagation();
}

function unlikePost(event) {
    // Molto simile a likePost
    button = event.currentTarget;

    const formData = new FormData();
    formData.append('postid', button.parentNode.parentNode.dataset.id);
    fetch("unlike_post.php", {method: 'post', body: formData}).then(fetchResponse)
    .then(function (json){ return updateLikes(json, button); });

    button.classList.remove('liked');
    button.classList.add('like');

    button.removeEventListener('click', unlikePost);
    button.addEventListener('click', likePost);
}

function displayModalUsers(json) {
    if (!json.length) return;
    const modal = document.getElementById('modal');
    const place = document.getElementById('modal_place');
    place.innerHTML = '';

    for (i in json) {
        // Mostro tutti gli utenti che hanno messo like (JSON da fetch_likes)
        const userinfo = document.createElement('div');
        userinfo.classList.add('userinfo');
        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        userinfo.appendChild(avatar);
        const names = document.createElement('a');
        names.href = json[i].username;
        names.classList.add('names');
        userinfo.appendChild(names);
        const name = document.createElement('div');
        name.classList.add('name');
        name.textContent = json[i].name + " " + json[i].surname;
        if (json[i].verified === '1') {
            const verified = document.createElement('span');
            verified.classList.add('verified');
            name.appendChild(verified);
        }
        names.appendChild(name);
        const username = document.createElement('div');
        username.classList.add('username');
        username.textContent = "@"+json[i].username;
        names.appendChild(username);
        const propic = document.createElement('img');
        propic.src = json[i].propic;
        avatar.appendChild(propic);

        place.appendChild(userinfo);
    }

    modal.classList.remove('hidden');
    setTimeout(function(){
        modal.classList.remove('invisible');
    }, 20);

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth+"px");
    document.body.classList.add('om');
}

function closeModal(event) {
    // Classica chiusura della modale
    const modal = document.getElementById('modal');
    modal.classList.add('invisible');
    setTimeout(function(){ 
        modal.classList.add('hidden'); 
    }, 300);
    document.body.classList.remove('om');
}

function commentPost(event) {
    const post =  event.currentTarget.parentNode.parentNode;
    const comments = post.querySelector(".comments");

    if (comments.clientHeight == 0) {
        // Se non c'è alcun commento
        const formData = new FormData();
        formData.append('postid', post.dataset.id);
        fetch("fetch_or_send_comments.php", {method: 'post', body: formData}).then(fetchResponse).then(function (json){ return updateComments(json, post.querySelector(".comments")); });
    } else {
        comments.style.height = 0;
    }
}

function updateComments(json, section) {
    const container = section.querySelector(".past_messages");
    container.innerHTML = '';
    let i;
    // Scorro l'array dal commento più recente al più vecchio
    for (i = Object.keys(json).length-1; i >= 0; i--) {
        // Creo gli oggetti che contengono i commenti
        const message = document.createElement('div');
        const userinfo = document.createElement('div');
        userinfo.classList.add('userinfo');
        message.appendChild(userinfo);
        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        userinfo.appendChild(avatar);
        const av_img = document.createElement('img');
        av_img.src = json[i].propic;
        avatar.appendChild(av_img);
        const username = document.createElement('a');
        username.href = json[i].username;
        username.classList.add('username');
        username.textContent = "@"+json[i].username;
        if (json[i].verified === '1') {
            const verified = document.createElement('span');
            verified.classList.add('verified');
            username.appendChild(verified);
        }
        userinfo.appendChild(username);
        const time = document.createElement('div');
        time.classList.add('time');
        time.textContent = json[i].time;
        userinfo.appendChild(time);
        const text = document.createElement('div');
        text.classList.add('text');
        parseEmotes(json[i].text, text);
        // text.textContent = json[i].text;
        message.appendChild(text);

        container.appendChild(message);
    } 
    
    container.scrollTop = container.scrollHeight;
    section.style.height = section.scrollHeight;
}

function sendNewComment(event) {
    const cont = event.currentTarget.parentNode.parentNode;
    const formData = new FormData(event.currentTarget);
    fetch("fetch_or_send_comments.php", {method: 'post', body: formData}).then(fetchResponse).then(function (json){ return updateComments(json, cont); });
    const t = event.currentTarget.querySelector('input[type=text]');
    t.blur();
    t.value = "";
    event.preventDefault();
}

// Scroll per aggiornare i post
window.touchmove =  window.onscroll = function(ev) {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 2 && onScrollCanLoad) {
        onScrollCanLoad = false;
        fetchPosts();
    }
};


function customStopPropagation(event) {
    event.stopPropagation();
}

// NAVBAR MOBILE

document.addEventListener('touchstart', handleTouchStart, false); 
document.addEventListener('touchmove', handleTouchMove, false);
let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    } 
    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;
    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
        if ( xDiff > 0 ) closeSidenav();
        else openSidenav();
    } 

    xDown = null;
    yDown = null;
};

function openSidenav() {
    if(!window.matchMedia("(max-width: 960px)").matches) return;
    const back = document.getElementById('sidenav');
    back.classList.remove('hidden');
    setTimeout(function(){
        back.classList.remove('invisible');
        document.getElementById('sidenav_content').classList.add('open');
    }, 3);
}

function closeSidenav() {
    const back = document.getElementById('sidenav');
    back.querySelector('#sidenav_content').classList.remove('open');
    back.classList.add('invisible');
    setTimeout(function(){ 
        back.classList.add('hidden'); 
    }, 303);
}

document.getElementById('s_nav').addEventListener('click', openSidenav);
document.getElementById('sidenav').addEventListener('click', closeSidenav);
document.getElementById('sidenav').addEventListener('click', customStopPropagation);




// Event Listener modale
let onScrollCanLoad = false;
let lastFetchedPostId = null;
document.getElementById('modal_close').addEventListener('click', closeModal);
document.querySelector('#modal .window').addEventListener('click', customStopPropagation);
document.getElementById('modal').addEventListener('click', closeModal);
fetchPosts();




// Leggere e scrivere i commenti

const emotesNames = ['monkaS', 'monkaW', 'EZ', 'pepeLaugh', 'weirdChamp', 'FeelsRainMan', 'ricardoFlick', 'KEKW', 'Clap', 'monkaBan'];
const emotesImage = ['https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/1x',
                    'https://cdn.betterttv.net/emote/59ca6551b27c823d5b1fd872/1x',
                    'https://cdn.betterttv.net/emote/5590b223b344e2c42a9e28e3/1x',
                    'https://cdn.betterttv.net/emote/5c548025009a2e73916b3a37/1x',
                    'https://cdn.betterttv.net/emote/5d20a55de1cfde376e532972/1x',
                    'https://cdn.betterttv.net/emote/57850b9df1bf2c1003a88644/1x',
                    'https://cdn.betterttv.net/emote/5bc2143ea5351f40921080ee/1x',
                    'https://cdn.betterttv.net/emote/5d793f2e14011815db9377d2/1x',
                    'https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/1x',
                    'https://cdn.betterttv.net/emote/5be43ddea550811484ecf547/1x']

function parseEmotes(t, place) {
    t = t.split(' ');
    let e;
    for (let i of t) {
        e = emotesNames.indexOf(i);
        if (e > -1) {
            const emote = document.createElement('div');
            emote.classList.add('emote');
            const img = document.createElement('img');
            img.src = emotesImage[e];
            img.title = i;
            emote.appendChild(img);
            place.appendChild(emote);
            place.appendChild(document.createTextNode(" "));
        } else {
            const word = document.createTextNode(i+" ");
            place.appendChild(word);
        }
    }    	   	
}

function chooseEmote(event) {
    const b = event.currentTarget;
    const c = b.parentNode.parentNode;
    if (b.dataset.open == 0) {
        const emotebox = document.createElement('div');
        emotebox.classList.add('emotebox');
        for (let i = 0; i < emotesNames.length; i++) {
            const emote = document.createElement('img');
            emote.src = emotesImage[i];
            emote.title = emotesNames[i];
            emote.addEventListener('click', printEmote);
            emotebox.appendChild(emote);
        }
        c.appendChild(emotebox);
        c.style.height = (parseInt(c.style.height,10)+emotebox.scrollHeight)+"px";
        b.dataset.open = 1;
    } else {
        const box = c.querySelector('.emotebox');
        c.style.height = (parseInt(c.style.height,10)-box.scrollHeight)+"px";
        box.remove();
        b.dataset.open = 0;
    }
}

function printEmote(event) {
    console.log("Emote");
    const b = event.currentTarget;
    const c = b.parentNode.parentNode.querySelector('form input[type=text]');
    c.value += (c.value[c.value.length-1] == ' ' || !c.value.length ? "" : " ")+b.title+" ";
    c.focus();
}

