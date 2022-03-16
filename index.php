<?php
if(isset($_POST['submit'])){
$json = "jsoncontents:".$_POST['jsoncontents']."
";

$file=fopen("saved.txt", "a");
fwrite($file, $Name);
fwrite($file, $Pass);
fclose($file);
}
?>