<?php 
    /*******************************************************
        Preleva la sezione commenti e, se ne è stato inviato
        uno, lo aggiunge prima di eseguire la query che ritorna
        i commenti, in modo da avere la lista aggiornata
    ********************************************************/
    require_once 'auth.php';
    if (!$userid = checkAuth()) exit;

    header('Content-Type: application/json');


    $conn = mysqli_connect($dbconfig['host'], $dbconfig['user'], $dbconfig['password'], $dbconfig['name']);

    $userid = mysqli_real_escape_string($conn, $userid);
    $postid = mysqli_real_escape_string($conn, $_POST["postid"]);

    // Se la richiesta è di aggiunta del commento, faccio insert, altrimenti visualizzo soltanto
    if(isset($_POST["comment"])) {
        if (!empty($_POST["comment"])) {
            // Aggiungo il commento come entry
            $text = mysqli_real_escape_string($conn, $_POST["comment"]);
            $in_query = "INSERT INTO comments(user, post, text) VALUES($userid, $postid, '".$text."')";
            // Scatta il trigger che aggiorna il numero di commenti
            mysqli_query($conn, $in_query) or die (mysqli_error($conn));   
        }
    }

    // Prendo tutti gli user che hanno commentato quel post
    $out_query = "SELECT comments.id AS id, username, propic, text, time, verified 
                    FROM comments LEFT JOIN users ON user = users.id 
                    WHERE comments.post = $postid ORDER BY id DESC LIMIT 30";
    
    $res = mysqli_query($conn, $out_query) or die (mysqli_error($conn));

    $returnarray = array();

    while($entry = mysqli_fetch_assoc($res)) {
        // Per ogni utente, ritorno le informazioni
        $propic = $entry['propic'] == null ? "images/default_avatar.png" : $entry['propic'];
        $returnarray[] = array('id' => $entry['id'], 'username' => $entry['username'], 'verified' => $entry['verified'], 
                                        'propic' => $propic, 'text' => $entry['text'], 'time' => getTime($entry['time']));

    }

    echo json_encode($returnarray);

    mysqli_close($conn);

    exit;

    function getTime($timestamp) {      
        // Ritorna la data di pubblicazione del post, relativamente alla data attuale       
        $old = strtotime($timestamp); 
        $diff = time() - $old;           
        $old = date('d/m/y', $old);

        if ($diff /60 <1) {
            return intval($diff%60)." sec";
        } else if ($diff / 60 < 60) {
            return intval($diff/60)." min";
        } else if ($diff / 3600 <24) {
            return intval($diff/3600) . " h";
        } else if ($diff/86400 < 30) {
            return intval($diff/86400) . " g";
        } else {
            return $old; 
        }
    }
    
?>