<?php 
    require_once 'auth.php';
    if (!$userid = checkAuth()) {
        header("Location: login.php");
        exit;
    }
?>
<html>
    <?php 
        // Carico le informazioni dell'utente loggato per visualizzarle nella sidebar (mobile)
        $conn = mysqli_connect($dbconfig['host'], $dbconfig['user'], $dbconfig['password'], $dbconfig['name']);
        $userid = mysqli_real_escape_string($conn, $userid);
        $res = mysqli_query($conn, "SELECT username, name, surname, propic, verified, dark FROM users WHERE id = $userid");
        $userinfo = mysqli_fetch_assoc($res);
    ?>

    <head>
        <link rel='stylesheet' href='./style/create_post.css'>
        <script src='./scripts/create_post.js' defer></script>

        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/png" href="favicon.png">
        <meta charset="utf-8">

        <title>YourEvents</title>
    </head>
    <body>
    <header>
            <nav>
                <div id="s_nav">
                </div>
                <div class="l_nav">
                    <h1>Your best songs</h1>
                    <a href="./">Home</a>
                    <a href="logout.php">Logout</a><br><br>
                </div>
                <div class="r_nav">
                    <a href="create" class="here">Scegli le canzoni del tuo repertorio</a>
                </div>
            </nav>
            <section id="newpost">
                <form autocomplete="off">
                <!-- action="do_search_content.php" method="post" -->
                <h1>Cosa vuoi condividere?</h1>
                    <label><input type="radio" name="type" value="spotify">🎵 Musica</label>
                    <br><input type="text" name="search" id="searchbox" placeholder="Cerca">
                    <div class="catgen"><button id="catgen">Genera </button></div>
                    <div class="think"><button id="think">Motiva la tua scelta</button></div>
                    <br><input type="submit" value="Cerca">
                    <div class="spotify">Esegui la ricerca con Spotify<div></div></div>
                   
                </form>
            
            </section>
    </header> 
    <main>
        <section class="container"> <strong>Qui saranno mostrati i risultati della tua ricerca</strong>

            <div id="results">
                
            </div>
        </section>
    </main>
    <section id="title_modal" class="hidden invisible">
        <div class="window">
            <div id="title_form">
                <button id="close_modal">Chiudi</button>
                <h2>Motiva la tua scelta</h2>    
                <form>
                    <input type="submit">
                    <textarea name="text"></textarea>
                </form>
                <div id="modal_preview">
                </div>
            </div>
            <div id="dispatch_result">
                <div id="dispatch_result_success" class="hidden invisible">
                    <svg id="successAnimation" xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 70 70">
                    <circle id="successAnimationCircle" cx="35" cy="35" r="24" stroke="#005596" stroke-width="2" stroke-linecap="round" fill="transparent"/>
                    <polyline id="successAnimationCheck" stroke="#005596" stroke-linecap="round" stroke-width="2" points="23 34 34 43 47 27" fill="transparent"/>
                    </svg><br>
                    <span>Post salvato con successo</span><br>
                    <button id="modal_newpost_success">Condividi ancora</button><br>
                    <a href="home.php">Vai alla home</a>
                </div>
                <div id="dispatch_result_fail" class="hidden invisible">
                    <svg id="failureAnimation" xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 70 70">
                    <circle id="failureAnimationCircle" cx="35" cy="35" r="24" stroke="#005596" stroke-width="2" stroke-linecap="round" fill="transparent"/>
                    <polyline class="failureAnimationCheckLine" stroke="#005596" stroke-width="2" stroke-linecap="round" points="25,25 45,45" fill="transparent" />
                    <polyline class="failureAnimationCheckLine" stroke="#005596" stroke-width="2" stroke-linecap="round" points="45,25 25,45" fill="transparent" />
                    </svg><br>
                    <span>Errore nella creazione del post</span><br>
                    <button id="modal_newpost_fail">Riprova</button><br>
                    <a href="home.php">Vai alla home</a>
                </div>
            </div>
        </div>
    </section>
    <section id="sidenav" class="invisible hidden">
        <div class="bar" id="sidenav_content">
            <div class="profile">
                <div class="avatar" style="background-image: url(<?php echo $userinfo['propic'] == null ? "images/default_avatar.png" : $userinfo['propic'] ?>)">
                </div>
                <div class="name">
                    <?php 
                        echo $userinfo['name']." ".$userinfo['surname']." ".($userinfo['verified'] ? "<span class='verified'></span>" : ""); 
                    ?>
                </div>
                <div class="username">
                    @<?php echo $userinfo['username'] ?>
                </div>
            </div>
            <a href="./">Home</a>
            <a href="create" class="here">Nuovo Post</a>
            <a href="logout.php">Logout</a>
           
        </div>
    </section>
    </body>
</html>

<?php mysqli_close($conn); ?>
