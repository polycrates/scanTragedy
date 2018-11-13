<?php
$data = $_POST['id'];
$title = $_POST['title'];
$handle = fopen($title.".html", 'w+');

if($handle)
{
if(!fwrite($handle, $data ))
echo "ok";
}
?>
