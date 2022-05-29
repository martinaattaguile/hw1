<?php 
    /*******************************************************
        Ritorna i like relativi a un post
    ********************************************************/
    require_once 'auth.php';
    if (!checkAuth()) exit;
    
    header('Content-Type: application/json');

    $conn = mysqli_connect($dbconfig['host'], $dbconfig['user'], $dbconfig['password'], $dbconfig['name']);

    $postid = mysqli_real_escape_string($conn, $_POST["postid"]);

    // Prendo tutti gli utenti che hanno messo like a quel post
    $query = "SELECT * FROM likes JOIN users ON likes.user = users.id WHERE likes.post = $postid";

    $res = mysqli_query($conn, $query) or die(mysqli_error($conn));
    
    // Creo l'array che conterrà i miei risultati
    $likesArray = array();
    if (mysqli_num_rows($res) > 0) {
        // Se ci sono risultati, li scorro e riempio l'array che ritornerò al frontend
        while($entry = mysqli_fetch_assoc($res)) {
            $propic = $entry['propic'] == null ? "images/default_avatar.png" : $entry['propic'];
            $likesArray[] = array('propic' => $propic, 'name' => $entry['name'], 
                                'surname' => $entry['surname'], 'username' => $entry['username'], 'id' => $entry['id'], 
                                'verified' => $entry['verified']);
        }
    }
    mysqli_close($conn);
    echo json_encode($likesArray);

    exit;
?>